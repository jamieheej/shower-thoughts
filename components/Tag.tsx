import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';

type TagProps = {
  label: string;
  onRemove?: () => void;
};

const Tag: React.FC<TagProps> = ({ label, onRemove }) => {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <Text style={styles.removeText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    backgroundColor: '#f5f2e8',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e8e2d0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    color: '#555555',
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
    color: '#555555',
    fontWeight: 'bold',
    fontSize: 12,
    lineHeight: 16,
  },
});

export default Tag; 