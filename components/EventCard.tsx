import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';

type Props = {
  title: string;
  date: string;
  time?: string;
  location?: string;
  image?: string;
};

const EventCard: React.FC<Props> = ({ title, date, time, location, image }) => {
  return (
    <View style={s.card}>
      {image ? (
        <Image source={{ uri: image }} style={s.image} contentFit="cover" transition={300} />
      ) : (
        <View style={s.noImage} />
      )}
      <View style={s.body}>
        <Text style={s.title} numberOfLines={2}>{title}</Text>
        <Text style={s.meta}>{date}{time ? ' · ' + time : ''}</Text>
        {location ? <Text style={s.location}>{location}</Text> : null}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: T.surfaceGlass,
    borderRadius: Sizes.radiusXl,
    overflow: 'hidden',
    marginBottom: Sizes.gapMd,
    borderWidth: 1,
    borderColor: T.cardBorder,
    ...Shadows.md,
  },
  image: { width: 100, height: 100 },
  noImage: { width: 100, height: 100, backgroundColor: T.surfaceBorder },
  body: { padding: 14, flex: 1, gap: 4, justifyContent: 'center' },
  title: { ...Typography.body, color: T.textPrimary, fontWeight: '700' },
  meta: { ...Typography.caption, color: T.textSecondary },
  location: { ...Typography.caption, color: T.textTertiary },
});

export default EventCard;
