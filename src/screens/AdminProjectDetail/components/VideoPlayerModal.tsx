import React from 'react';
import { Modal, TouchableOpacity, View, StyleSheet, Dimensions, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import Video from 'react-native-video';

interface VideoPlayerModalProps {
  visible: boolean;
  videoUrl: string | null;
  onClose: () => void;
}

export function VideoPlayerModal({ visible, videoUrl, onClose }: VideoPlayerModalProps) {
  if (!visible || !videoUrl) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
          <View style={styles.closeIconWrapper}>
            <X color="white" size={24} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.videoContainer}>
          <Video 
            source={{ uri: videoUrl }}
            style={styles.video}
            controls={true}
            resizeMode="contain"
            ignoreSilentSwitch="ignore"
            playWhenInactive={false}
            playInBackground={false}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 10,
  },
  closeIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },
  video: {
    width: '100%',
    height: '100%',
  }
});
