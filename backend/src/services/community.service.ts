import type { CommunityPost, PublicUser } from "../models";
import { communityRepository } from "../repositories/community.repository";
import { userRepository } from "../repositories/user.repository";
import { badRequest, forbidden, notFound } from "../utils/http";
import { uid } from "../utils/ids";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export type CommunityPostView = CommunityPost & {
  author: Pick<PublicUser, "id" | "name" | "role" | "avatarUrl"> | null;
};

function toPublic(user: ReturnType<typeof Object>): PublicUser | null {
  if (!user) return null;
  const { passwordHash: _ignored, ...rest } = user;
  void _ignored;
  return rest as PublicUser;
}

async function decorate(post: CommunityPost): Promise<CommunityPostView> {
  const user = await userRepository.findById(post.authorId);
  const pub = user ? toPublic(user) : null;
  return {
    ...post,
    author: pub
      ? { id: pub.id, name: pub.name, role: pub.role, avatarUrl: pub.avatarUrl }
      : null,
  };
}

export const communityService = {
  async list(): Promise<CommunityPostView[]> {
    const posts = await communityRepository.list();
    return Promise.all(posts.map(decorate));
  },

  async create(
    authorId: string,
    payload: { text?: string; imageDataUrl?: string },
  ): Promise<CommunityPostView> {
    const text = payload.text?.trim() ?? "";
    const imageDataUrl = payload.imageDataUrl?.trim();
    if (!text && !imageDataUrl)
      throw badRequest("El post debe tener texto o imagen");
    if (text.length > 1500)
      throw badRequest("Texto demasiado largo (máx 1500 caracteres)");
    if (imageDataUrl) {
      if (!/^data:image\/(png|jpe?g|webp|gif);base64,/.test(imageDataUrl))
        throw badRequest("Formato de imagen no soportado");
      const approxBytes = Math.ceil((imageDataUrl.length * 3) / 4);
      if (approxBytes > MAX_IMAGE_BYTES)
        throw badRequest("Imagen demasiado grande (máx 8MB)");
    }
    const post: CommunityPost = {
      id: uid(),
      authorId,
      text,
      imageDataUrl,
      createdAt: new Date().toISOString(),
      likes: [],
    };
    await communityRepository.create(post);
    return decorate(post);
  },

  async remove(id: string, requesterId: string): Promise<void> {
    const post = await communityRepository.findById(id);
    if (!post) throw notFound("Post no encontrado");
    if (post.authorId !== requesterId)
      throw forbidden("Sólo el autor puede borrar el post");
    await communityRepository.remove(id, requesterId);
  },

  async toggleLike(
    id: string,
    userId: string,
  ): Promise<CommunityPostView> {
    const updated = await communityRepository.toggleLike(id, userId);
    if (!updated) throw notFound("Post no encontrado");
    return decorate(updated);
  },
};
