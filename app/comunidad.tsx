import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { ApiError, api } from "@/lib/api";
import type { ApiCommunityPost } from "@/lib/types";

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `hace ${d} d`;
  return new Date(iso).toLocaleDateString("es-AR");
}

export default function ComunidadScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { status, user, token } = useAuth();

  const [posts, setPosts] = useState<ApiCommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.communityList();
      setPosts(data);
    } catch (err) {
      if (err instanceof ApiError) {
        Alert.alert("No se pudo cargar la comunidad", err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Permiso requerido",
          "Necesitamos acceso a tus fotos para adjuntar la imagen.",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }
      const asset = result.assets[0];
      if (!asset.base64) {
        Alert.alert(
          "No se pudo leer la imagen",
          "Intentá nuevamente con otra foto.",
        );
        return;
      }
      const mime = asset.mimeType ?? "image/jpeg";
      setImageDataUrl(`data:${mime};base64,${asset.base64}`);
    } catch (err) {
      Alert.alert(
        "No se pudo abrir la galería",
        err instanceof Error ? err.message : "Error desconocido",
      );
    }
  };

  const submit = async () => {
    if (!token) return;
    if (!text.trim() && !imageDataUrl) {
      Alert.alert("Mensaje vacío", "Escribí algo o adjuntá una foto.");
      return;
    }
    setBusy(true);
    try {
      const created = await api.communityCreate(token, {
        text: text.trim(),
        imageDataUrl: imageDataUrl ?? undefined,
      });
      setPosts((prev) => [created, ...prev]);
      setText("");
      setImageDataUrl(null);
    } catch (err) {
      Alert.alert(
        "No se pudo publicar",
        err instanceof ApiError ? err.message : "Error de conexión",
      );
    } finally {
      setBusy(false);
    }
  };

  const toggleLike = async (id: string) => {
    if (!token) return;
    try {
      const updated = await api.communityToggleLike(token, id);
      setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      if (err instanceof ApiError) {
        Alert.alert("No se pudo registrar el like", err.message);
      }
    }
  };

  const remove = async (id: string) => {
    if (!token) return;
    try {
      await api.communityRemove(token, id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      if (err instanceof ApiError) {
        Alert.alert("No se pudo eliminar", err.message);
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 80,
          paddingTop: insets.top + 4,
          gap: 14,
        }}
        ListHeaderComponent={
          <View style={{ gap: 16 }}>
            <AppHeader
              title="Comunidad aeronáutica"
              subtitle="Mini red de pilotos y aeródromos"
            />

            {status === "authenticated" && user ? (
              <View style={{ paddingHorizontal: 20, gap: 12 }}>
                <View
                  style={[
                    styles.composer,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderRadius: colors.radius,
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.foreground,
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        borderRadius: colors.radius - 4,
                      },
                    ]}
                    placeholder="Compartí novedades, fotos del último vuelo o tu aeródromo…"
                    placeholderTextColor={colors.mutedForeground}
                    value={text}
                    onChangeText={setText}
                    multiline
                  />
                  {imageDataUrl ? (
                    <View style={styles.previewWrap}>
                      <Image
                        source={{ uri: imageDataUrl }}
                        style={styles.previewImage}
                        resizeMode="cover"
                      />
                      <Pressable
                        onPress={() => setImageDataUrl(null)}
                        hitSlop={10}
                        style={[
                          styles.removeImageBtn,
                          { backgroundColor: colors.background + "EE" },
                        ]}
                      >
                        <Feather
                          name="x"
                          size={14}
                          color={colors.foreground}
                        />
                      </Pressable>
                    </View>
                  ) : null}
                  <View style={styles.composerActions}>
                    <Pressable
                      onPress={pickImage}
                      style={({ pressed }) => [
                        styles.actionBtn,
                        {
                          borderColor: colors.border,
                          borderRadius: colors.radius - 4,
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}
                    >
                      <Feather
                        name="image"
                        size={16}
                        color={colors.foreground}
                      />
                      <Text
                        style={[
                          styles.actionText,
                          { color: colors.foreground },
                        ]}
                      >
                        Foto
                      </Text>
                    </Pressable>
                    <PrimaryButton
                      label="Publicar"
                      icon="send"
                      loading={busy}
                      onPress={submit}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View style={{ paddingHorizontal: 20 }}>
                <View
                  style={[
                    styles.loginBanner,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderRadius: colors.radius,
                    },
                  ]}
                >
                  <Feather name="user-plus" size={20} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.bannerTitle,
                        { color: colors.foreground },
                      ]}
                    >
                      Sumate a la comunidad
                    </Text>
                    <Text
                      style={[
                        styles.bannerSub,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      Iniciá sesión para publicar fotos y novedades.
                    </Text>
                  </View>
                  <PrimaryButton
                    label="Ingresar"
                    icon="log-in"
                    onPress={() => router.push("/aeroclub-paywall")}
                  />
                </View>
              </View>
            )}

            {loading && posts.length === 0 ? (
              <View style={{ paddingHorizontal: 20, alignItems: "center" }}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUserId={user?.id ?? null}
            onLike={toggleLike}
            onRemove={remove}
          />
        )}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: 20 }}>
            <EmptyState
              icon="message-square"
              title="Aún no hay publicaciones"
              description="Sé el primero en compartir una foto o novedad con la red."
            />
          </View>
        }
      />
    </View>
  );
}

function PostCard({
  post,
  currentUserId,
  onLike,
  onRemove,
}: {
  post: ApiCommunityPost;
  currentUserId: string | null;
  onLike: (id: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const colors = useColors();
  const liked = !!currentUserId && post.likes.includes(currentUserId);
  const isOwner = currentUserId === post.authorId;
  const authorName = post.author?.name ?? "Anónimo";
  const authorRole = post.author?.role ?? "piloto";
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.primary + "1F", borderRadius: 999 },
            ]}
          >
            <Feather
              name={authorRole === "aerodromo" ? "map-pin" : "user"}
              size={16}
              color={colors.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.author, { color: colors.foreground }]}>
              {authorName}
            </Text>
            <Text style={[styles.metaSub, { color: colors.mutedForeground }]}>
              {authorRole === "aerodromo" ? "Aeródromo" : "Piloto"} ·{" "}
              {timeAgo(post.createdAt)}
            </Text>
          </View>
          {isOwner ? (
            <Pressable
              onPress={() => onRemove(post.id)}
              hitSlop={10}
              style={({ pressed }) => [
                styles.iconBtn,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Feather
                name="trash-2"
                size={14}
                color={colors.mutedForeground}
              />
            </Pressable>
          ) : null}
        </View>

        {post.text ? (
          <Text style={[styles.body, { color: colors.foreground }]}>
            {post.text}
          </Text>
        ) : null}

        {post.imageDataUrl ? (
          <Image
            source={{ uri: post.imageDataUrl }}
            style={[
              styles.postImage,
              { borderRadius: colors.radius - 4, borderColor: colors.border },
            ]}
            resizeMode="cover"
          />
        ) : null}

        <View style={styles.footer}>
          <Pressable
            onPress={() => onLike(post.id)}
            hitSlop={10}
            style={({ pressed }) => [
              styles.likeBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather
              name="heart"
              size={16}
              color={liked ? colors.destructive : colors.mutedForeground}
            />
            <Text
              style={[
                styles.likeText,
                {
                  color: liked ? colors.destructive : colors.mutedForeground,
                },
              ]}
            >
              {post.likes.length}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  composer: { padding: 14, borderWidth: 1, gap: 10 },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
  },
  previewWrap: { position: "relative" },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    backgroundColor: "#000",
  },
  removeImageBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  composerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  actionText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  loginBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderWidth: 1,
  },
  bannerTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  bannerSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  card: { padding: 14, borderWidth: 1, gap: 10 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  author: { fontFamily: "Inter_700Bold", fontSize: 14 },
  metaSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 2,
  },
  iconBtn: { padding: 6 },
  body: { fontFamily: "Inter_500Medium", fontSize: 14, lineHeight: 20 },
  postImage: {
    width: "100%",
    aspectRatio: 4 / 3,
    backgroundColor: "#000",
    borderWidth: 1,
  },
  footer: { flexDirection: "row", alignItems: "center", gap: 12 },
  likeBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  likeText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
});
