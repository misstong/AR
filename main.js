// import * as THREE from '../three.js-r132/build/three.module.js'
import { GLTFLoader} from './three.js-r132/examples/jsm/loaders/GLTFLoader.js'

const THREE = window.MINDAR.IMAGE.THREE;
const loadGLTF = path => {
    return new Promise(resolve => {
        const loader = new GLTFLoader();
        loader.load(path, (gltf) => {
            resolve(gltf)
        })
    
    })

}

const loadAudio = (path) => {
  return new Promise((resolve, reject) => {
    const loader = new THREE.AudioLoader();
    loader.load(path, (buffer) => {
      resolve(buffer);
    });
  });
}

const mockWithVideo = (path) => {
  navigator.mediaDevices.getUserMedia = () => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");

      video.oncanplay = () => {
	const startButton = document.createElement("button");
	startButton.innerHTML = "start";
	startButton.style.position = 'fixed';
	startButton.style.zIndex = 10000;
	document.body.appendChild(startButton);

	startButton.addEventListener('click', () => {
	  const stream = video.captureStream();
	  video.play();
	  document.body.removeChild(startButton);
	  resolve(stream);
	});
      };
      video.setAttribute('loop', '');
      video.setAttribute("src", path);
    });
  };
}

const mockWithImage = (path) => {
  navigator.mediaDevices.getUserMedia = () => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext('2d');

      const image = new Image();
      image.onload = () => {
	canvas.width = image.width;
	canvas.height = image.height;
	context.drawImage(image, 0, 0, image.width, image.height);
	const stream = canvas.captureStream();
	resolve(stream);
      }
      image.src = path;
    });
  };
}


document.addEventListener('DOMContentLoaded', () => {
    const start = async () => {

    mockWithVideo('./musicband1.mp4');
    // mockWithImage('./musicband-raccoon.png')
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: './musicband.mind',
    });
    const {renderer, scene, camera} = mindarThree;


        // const blond = await loadGLTF('../models/sexy_blond/scene.gltf')
        const blond = await loadGLTF('./models/sukonbusss_hololive/scene.gltf')
        blond.scene.position.set(0, -0.5, 0);
        blond.scene.scale.set(0.5, 0.5, 0.5);
        blond.scene.rotation.set(Math.PI/3,0,0)


        const anchor = mindarThree.addAnchor(0);
        anchor.group.add(blond.scene);

        const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
        scene.add(light);

        camera.position.set(0, 0, 5);

        const mixer = new THREE.AnimationMixer(blond.scene)
        const action = mixer.clipAction(blond.animations[0])
        action.play()


  const audioClip = await loadAudio('./musicband-background.mp3');
            const listener = new THREE.AudioListener();
    camera.add(listener);

    const audio = new THREE.PositionalAudio(listener);
    anchor.group.add(audio);
        audio.setBuffer(audioClip);
    audio.setRefDistance(100);
    audio.setLoop(true);

    anchor.onTargetFound = () => {
      audio.play();
    }
    anchor.onTargetLost = () => {
      audio.pause();
    }

        await mindarThree.start();

        const clock = new THREE.Clock()
        renderer.setAnimationLoop(() => {
            const delta = clock.getDelta()
            mixer.update(delta)
            renderer.render(scene, camera);
        });
    }

    start()
})