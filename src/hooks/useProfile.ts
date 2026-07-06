import { useCallback, useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabase';
import { useSession } from '../contexts/SessionContext';
import type { Profile } from '../types/database';

type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  updated_at: string;
};

type MutationResult = { error: string | null };

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    updatedAt: row.updated_at,
  };
}

export function useProfile(): {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  updateDisplayName: (name: string) => Promise<MutationResult>;
  uploadAvatar: () => Promise<MutationResult>;
} {
  const { session } = useSession();
  const userId = session?.user.id;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle<ProfileRow>();

      if (!isMounted) return;

      if (queryError) {
        setError(queryError.message);
        setIsLoading(false);
        return;
      }

      if (data) {
        setError(null);
        setProfile(toProfile(data));
        setIsLoading(false);
        return;
      }

      const { data: created, error: upsertError } = await supabase
        .from('profiles')
        .upsert({ id: userId, display_name: null, avatar_url: null })
        .select()
        .single<ProfileRow>();

      if (!isMounted) return;

      if (upsertError) {
        setError(upsertError.message);
      } else {
        setError(null);
        setProfile(toProfile(created));
      }
      setIsLoading(false);
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const updateDisplayName = useCallback(
    async (name: string): Promise<MutationResult> => {
      if (!userId) return { error: 'Sessão inválida.' };

      const updatedAt = new Date().toISOString();
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ display_name: name, updated_at: updatedAt })
        .eq('id', userId);

      if (updateError) {
        setError(updateError.message);
        return { error: updateError.message };
      }

      setError(null);
      setProfile((current) => (current ? { ...current, displayName: name, updatedAt } : current));
      return { error: null };
    },
    [userId],
  );

  const uploadAvatar = useCallback(async (): Promise<MutationResult> => {
    if (!userId) return { error: 'Sessão inválida.' };

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return { error: 'Permissão de acesso às fotos negada.' };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result.canceled) {
      return { error: null };
    }

    const asset = result.assets[0];
    const arraybuffer = await fetch(asset.uri).then((res) => res.arrayBuffer());
    const path = `${userId}/avatar.png`;

    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, arraybuffer, {
      contentType: asset.mimeType ?? 'image/jpeg',
      upsert: true,
    });

    if (uploadError) {
      setError(uploadError.message);
      return { error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path);
    const avatarUrl = `${publicUrlData.publicUrl}?updated=${Date.now()}`;
    const updatedAt = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl, updated_at: updatedAt })
      .eq('id', userId);

    if (updateError) {
      setError(updateError.message);
      return { error: updateError.message };
    }

    setError(null);
    setProfile((current) => (current ? { ...current, avatarUrl, updatedAt } : current));
    return { error: null };
  }, [userId]);

  return { profile, isLoading, error, updateDisplayName, uploadAvatar };
}
