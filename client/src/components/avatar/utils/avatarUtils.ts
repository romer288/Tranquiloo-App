
import * as THREE from 'three';

export const enhanceAvatarMaterials = (scene: THREE.Object3D) => {
  scene.traverse((child: any) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      
      if (child.material) {
        // Enhance skin materials
        if (child.material.name && child.material.name.toLowerCase().includes('skin')) {
          child.material.roughness = 0.7;
          child.material.metalness = 0.1;
        }
        
        // Enhance hair materials
        if (child.material.name && child.material.name.toLowerCase().includes('hair')) {
          child.material.roughness = 0.8;
          child.material.metalness = 0.2;
        }
      }
    }
  });
};

export const findMorphTargets = (scene: THREE.Object3D) => {
  let morphTargets = null;
  scene.traverse((child: any) => {
    if (child.isMesh && child.morphTargetDictionary && !morphTargets) {
      console.log('🎯 Found morph targets:', Object.keys(child.morphTargetDictionary));
      morphTargets = child;
    }
  });
  return morphTargets;
};

export const findHeadBone = (scene: THREE.Object3D) => {
  let headBone = null;
  scene.traverse((child: any) => {
    if (child.isBone && !headBone && (
      child.name.toLowerCase().includes('head') || 
      child.name.toLowerCase().includes('neck')
    )) {
      console.log('🗣️ Found head bone:', child.name);
      headBone = child;
    }
  });
  return headBone;
};

export const setupAvatarPosition = (scene: THREE.Object3D) => {
  scene.position.set(0, -1.2, 0);
  scene.scale.set(1.5, 1.5, 1.5);
  scene.rotation.y = 0;
};
