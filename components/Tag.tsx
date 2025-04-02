import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useUser } from '@/app/(context)/UserContext';

type TagProps = {
  label: string;
  onRemove?: () => void;
};

const Tag: React.FC<TagProps> = ({ label, onRemove }) => {
  const { theme } = useUser();
  
  return (
    <View style={[
      styles.tag, 
      { 
        backgroundColor: theme.tagBackground,
        borderColor: theme.border
      }
    ]}>
      <Text style={[styles.tagText, { color: theme.tagText }]}>{label}</Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <Text style={[styles.removeText, { color: theme.tagText }]}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 12,
  },
  removeButton: {
    marginLeft: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontWeight: 'bold',
    fontSize: 12,
    lineHeight: 16,
  },
});

export default Tag; 