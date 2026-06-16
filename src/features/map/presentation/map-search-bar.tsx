import React, { memo, useCallback, useRef } from 'react';
import {
  View, TextInput, Text, StyleSheet, FlatList, Keyboard, Pressable,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Search, X } from 'lucide-react-native';
import { useMapSearch, getCategoryConfig } from '@/features/map/application/map.hooks';
import type { CampusLocation } from '@/features/map/domain/location.entity';
import { LightTheme as T, Sizes, Shadows, Typography } from '@/constants/design-system';

interface MapSearchBarProps {
  onSelectLocation: (l: CampusLocation) => void;
  onSearchStateChange?: (s: boolean) => void;
}

export const MapSearchBar = memo(function MapSearchBar({
  onSelectLocation,
  onSearchStateChange,
}: MapSearchBarProps) {
  const { results, setSearch } = useMapSearch('');
  const [focused, setFocused] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const inp = useRef<TextInput>(null);

  const handleChange = useCallback(
    (t: string) => { setQuery(t); setSearch(t); },
    [setSearch],
  );
  const handleFocus = useCallback(() => {
    setFocused(true); onSearchStateChange?.(true);
  }, [onSearchStateChange]);
  const handleBlur = useCallback(() => {
    setTimeout(() => { setFocused(false); onSearchStateChange?.(false); }, 200);
  }, [onSearchStateChange]);
  const handleSelect = useCallback(
    (l: CampusLocation) => {
      onSelectLocation(l); setQuery(''); setSearch(''); setFocused(false); Keyboard.dismiss();
    },
    [onSelectLocation, setSearch],
  );
  const handleClear = useCallback(() => {
    setQuery(''); setSearch(''); inp.current?.focus();
  }, [setSearch]);

  return (
    <View style={ss.wrap}>
      <View style={[ss.bar, focused && ss.barFocused]}>
        <Search size={18} strokeWidth={1.8} color={T.textTertiary} />
        <TextInput
          ref={inp}
          style={ss.inp}
          placeholder="Buscar aulas, labs, oficinas..."
          placeholderTextColor={T.inputPlaceholder}
          value={query}
          onChangeText={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={handleClear} hitSlop={8}>
            <X size={16} strokeWidth={2} color={T.textTertiary} />
          </Pressable>
        )}
      </View>

      {focused && query.length >= 2 && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
          {results.length > 0 ? (
            <View style={ss.results}>
              <FlatList
                data={results.slice(0, 6)}
                keyExtractor={(i) => i.id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const config = getCategoryConfig(item.category);
                  return (
                    <Pressable
                      style={({ pressed }) => [ss.item, pressed && { backgroundColor: T.pressed }]}
                      onPress={() => handleSelect(item)}
                    >
                      <View style={[ss.itemDot, { backgroundColor: config.color + '22' }]}>
                        <Text style={[ss.itemDotLetter, { color: config.color }]}>
                          {config.label.charAt(0)}
                        </Text>
                      </View>
                      <View style={ss.itemContent}>
                        <Text style={ss.itemTitle}>{item.name}</Text>
                        {item.description && (
                          <Text style={ss.itemDesc} numberOfLines={1}>{item.description}</Text>
                        )}
                      </View>
                    </Pressable>
                  );
                }}
              />
            </View>
          ) : (
            <View style={ss.noRes}>
              <Text style={ss.noResT}>No se encontraron lugares</Text>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
});

const ss = StyleSheet.create({
  wrap: { zIndex: 100 },
  bar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.surfaceGlass,
    borderRadius: Sizes.radiusLg,
    paddingHorizontal: 16, height: 52,
    borderWidth: 1.5, borderColor: T.cardBorder,
    gap: 10,
    ...Shadows.md,
  },
  barFocused: {
    borderColor: T.primary,
    backgroundColor: T.surface,
    ...Shadows.lg,
  },
  inp: { flex: 1, fontSize: 15, color: T.inputText, paddingVertical: 0 },
  results: {
    backgroundColor: T.surface,
    borderRadius: Sizes.radiusLg,
    marginTop: 8, padding: 6,
    ...Shadows.lg,
    borderWidth: 1, borderColor: T.cardBorder,
    maxHeight: 260,
  },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 13, paddingHorizontal: 14,
    borderRadius: 12,
  },
  itemDot: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  itemDotLetter: {
    fontSize: 16, fontWeight: '800',
  },
  itemContent: { flex: 1 },
  itemTitle: { ...Typography.body, color: T.textPrimary, fontWeight: '600' },
  itemDesc: { ...Typography.caption, color: T.textTertiary, marginTop: 2 },
  noRes: {
    backgroundColor: T.surface, borderRadius: Sizes.radiusLg, marginTop: 8,
    padding: 20, alignItems: 'center', ...Shadows.md,
  },
  noResT: { ...Typography.bodySm, color: T.textTertiary },
});
