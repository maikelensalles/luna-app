import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type DimensionValue, type LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../../constants/theme';
import { getPracticeIcon } from '../../utils/practiceIcons';
import type { DailyPracticeItem, Practice } from '../../types/database';

type JourneyItem = DailyPracticeItem & { practices: Practice };

const NODE_SIZE = 64;
const ROW_HEIGHT = 110;
const ICON_SIZE = 34;
const CHECK_BADGE_SIZE = 20;
const LABEL_WIDTH = 72;
const LEFT_RATIO = 0.25;
const RIGHT_RATIO = 0.75;
const COMPLETED_GLOW_SIZE = 76;
const CONQUEST_SIZE = 72;
const CONQUEST_GLOW_SIZE = 100;
const TOP_PADDING = 60;

type NodeDescriptor =
  | { kind: 'practice'; item: JourneyItem; x: number; y: number }
  | { kind: 'conquest'; x: number; y: number };

function xRatio(index: number): number {
  return index % 2 === 0 ? LEFT_RATIO : RIGHT_RATIO;
}

function nodeTopFor(index: number, containerHeight: number): number {
  return containerHeight - (index + 1) * ROW_HEIGHT;
}

function buildNodes(
  items: JourneyItem[],
  allCompletedToday: boolean,
  containerWidth: number,
  containerHeight: number,
): NodeDescriptor[] {
  const validItems = items.filter((item) => item.practices);

  const nodes: NodeDescriptor[] = validItems.map((item, index) => ({
    kind: 'practice',
    item,
    x: containerWidth * xRatio(index),
    y: nodeTopFor(index, containerHeight) + NODE_SIZE / 2,
  }));

  if (allCompletedToday) {
    const index = validItems.length;
    nodes.push({
      kind: 'conquest',
      x: containerWidth * 0.5,
      y: nodeTopFor(index, containerHeight) + CONQUEST_SIZE / 2,
    });
  }

  return nodes;
}

function buildPathD(nodes: NodeDescriptor[]): string {
  return nodes.map((node, index) => `${index === 0 ? 'M' : 'L'} ${node.x} ${node.y}`).join(' ');
}

export function TodayPracticeTrail({
  items,
  allCompletedToday,
  onToggleItem,
}: {
  items: JourneyItem[];
  allCompletedToday: boolean;
  onToggleItem: (itemId: string) => void;
}) {
  const [containerWidth, setContainerWidth] = useState(0);
  const totalNodes = items.length + (allCompletedToday ? 1 : 0);
  const containerHeight = totalNodes * ROW_HEIGHT + TOP_PADDING;

  function handleLayout(event: LayoutChangeEvent) {
    setContainerWidth(event.nativeEvent.layout.width);
  }

  const nodes = containerWidth > 0 ? buildNodes(items, allCompletedToday, containerWidth, containerHeight) : [];

  return (
    <View style={[styles.container, { height: containerHeight }]} onLayout={handleLayout}>
      {containerWidth > 0 && (
        <Svg style={StyleSheet.absoluteFill} width={containerWidth} height={containerHeight}>
          <Path
            d={buildPathD(nodes)}
            stroke={theme.colors.accentBorder}
            strokeWidth={2}
            strokeDasharray="6,6"
            fill="none"
          />
        </Svg>
      )}

      {nodes.map((node, index) => {
        const left: DimensionValue = `${(node.x / containerWidth) * 100}%`;
        const nodeTop = nodeTopFor(index, containerHeight);

        if (node.kind === 'conquest') {
          return (
            <View key="conquest" style={StyleSheet.absoluteFill} pointerEvents="none">
              <View
                style={[
                  styles.glow,
                  styles.glowConquest,
                  {
                    top: node.y - CONQUEST_GLOW_SIZE / 2,
                    left,
                    width: CONQUEST_GLOW_SIZE,
                    height: CONQUEST_GLOW_SIZE,
                    borderRadius: CONQUEST_GLOW_SIZE / 2,
                    transform: [{ translateX: -CONQUEST_GLOW_SIZE / 2 }],
                  },
                ]}
              />
              <Image
                source={require('../../../assets/badges/badge-conquista.png')}
                style={[
                  styles.conquestImage,
                  { top: nodeTop, left, transform: [{ translateX: -CONQUEST_SIZE / 2 }] },
                ]}
                resizeMode="contain"
              />
            </View>
          );
        }

        const { item } = node;

        return (
          <View key={item.id} style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {item.completed && (
              <View
                style={[
                  styles.glow,
                  styles.glowCompleted,
                  {
                    top: node.y - COMPLETED_GLOW_SIZE / 2,
                    left,
                    width: COMPLETED_GLOW_SIZE,
                    height: COMPLETED_GLOW_SIZE,
                    borderRadius: COMPLETED_GLOW_SIZE / 2,
                    transform: [{ translateX: -COMPLETED_GLOW_SIZE / 2 }],
                  },
                ]}
              />
            )}

            <Pressable
              onPress={() => onToggleItem(item.id)}
              style={[styles.node, { top: nodeTop, left, transform: [{ translateX: -NODE_SIZE / 2 }] }]}
            >
              <Image
                source={getPracticeIcon(item.practices)}
                style={[styles.icon, !item.completed && styles.iconPending]}
                resizeMode="contain"
              />
              {item.completed && (
                <Image
                  source={require('../../../assets/icons/icon-check.png')}
                  style={styles.checkBadge}
                  resizeMode="contain"
                />
              )}
            </Pressable>

            <Text
              style={[
                styles.label,
                {
                  top: nodeTop + NODE_SIZE + theme.spacing.xs,
                  left,
                  transform: [{ translateX: -LABEL_WIDTH / 2 }],
                },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.practices.title}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    zIndex: 0,
  },
  glowCompleted: {
    backgroundColor: theme.colors.sage,
    opacity: 0.15,
    shadowColor: theme.colors.sage,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  glowConquest: {
    backgroundColor: theme.colors.gold,
    opacity: 0.25,
    shadowColor: theme.colors.gold,
    shadowOpacity: 0.6,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  node: {
    position: 'absolute',
    zIndex: 1,
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  iconPending: {
    opacity: 0.6,
  },
  checkBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: CHECK_BADGE_SIZE,
    height: CHECK_BADGE_SIZE,
  },
  label: {
    position: 'absolute',
    width: LABEL_WIDTH,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
  },
  conquestImage: {
    position: 'absolute',
    zIndex: 1,
    width: CONQUEST_SIZE,
    height: CONQUEST_SIZE,
  },
});
