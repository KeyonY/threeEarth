import libApp from "./lab-base";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

const gl = {
  cameraDefaults: {
    posCamera: new THREE.Vector3( 80, 160, 550 ),
    posCameraTarget: new THREE.Vector3( 100000, 0, -100000 ),
    near: 0.1, // 摄像机视锥体近端面
    far: 10000, // 摄像机视锥体远端面
    fov: 45 // 视角
  },
  texture_path: '/assets/earth/',
  earthParticles: new THREE.Object3D({name: 'earth-particles'}), // mesh的存储和编辑对象-地球
  cloud: new THREE.Object3D(), // mesh的存储和编辑对象-云层
  textureLoader: new THREE.TextureLoader(),
  dotTexture: new THREE.TextureLoader().load('/assets/earth/dot.png'),
  CITY_RADIUS: 100,
  BLINT_SPEED: 0.05,
  radius: 240, // 地球半径
  sputniks: [], // 人造卫星对象
  orbits: [], // 轨道
  spriteGroup: null, // 空间中分布的粒子组
  cloudBlendGroup: new THREE.Object3D({name: 'cloud-blend-group'}), // 空间中云层光晕组
  color: { // 颜色配置
    planet: '#005ca1', // 地球主体颜色 科技绿-00a75c
    ocean: '#005ca1', // 海洋颜色
    cloud: '#3a709e', // 云层颜色 弱科技绿-B2F2C5
    sprite: '#3a709e', // 空间粒子颜色
  },
  init () {
    libApp.reset();

    this.setScene();

    this.setRenderer();

    this.setCamera();
    this.setCamera2();

    this.setControls();
    this.setControls2();
    this.unifiedSetControls();

    this.resizeWindow();

    // this.setHelper();

    this.loaderEarth(animate);

  },
  // 销毁
  destroy () {
    libApp.reset();
  },
  // 设置辅助
  setHelper () {
    let axes = new THREE.AxesHelper(this.radius + 10);
    libApp.scene2.add(axes);
  },
  // 设置场景
  setScene () {
    libApp.scene = new THREE.Scene();
    libApp.scene2 = new THREE.Scene();
  },
  // 设置渲染器
  setRenderer () {
    libApp.renderer = new THREE.WebGLRenderer({
      antialias: true, // 是否执行抗锯齿
      alpha: false
    });
    libApp.renderer.setClearColor('#050505');
    libApp.renderer.autoClear = false;
    let dom = document.getElementById('canvasContainer');
    libApp.renderer.setSize( dom.offsetWidth, dom.offsetHeight - 5 );
    dom.appendChild( libApp.renderer.domElement );
  },
  // 设置相机
  setCamera () {
    libApp.controlsDom = document.getElementById('canvasContainer');
    let aspectRatio = libApp.controlsDom.offsetWidth / libApp.controlsDom.offsetHeight;
    libApp.camera = new THREE.PerspectiveCamera( this.cameraDefaults.fov, aspectRatio, this.cameraDefaults.near, this.cameraDefaults.far );
    libApp.camera.position.copy(this.cameraDefaults.posCamera);
    libApp.camera.translateX(libApp.scene.position.x);
  },
  // 设置相机2
  setCamera2 () {
    let aspectRatio = libApp.controlsDom.offsetWidth / libApp.controlsDom.offsetHeight;
    libApp.camera2 = new THREE.PerspectiveCamera( this.cameraDefaults.fov, aspectRatio, this.cameraDefaults.near, this.cameraDefaults.far );
    libApp.camera2.position.set(0,0,this.cameraDefaults.posCamera.z);
    libApp.camera2.translateX(libApp.scene.position.x);
  },
  // 统一设置控制器的缩放限制
  unifiedSetControls () {
    let max = 600;
    let min = 550;
    libApp.controls.maxDistance = max; // 限制相机外移多少
    libApp.controls.minDistance = min; // 限制相机内移多少
    libApp.controls2.maxDistance = max; // 限制相机外移多少
    libApp.controls2.minDistance = min; // 限制相机内移多少
  },
  // 设置控制器
  setControls () {
    libApp.controls = new OrbitControls( libApp.camera, libApp.controlsDom );
    // -------轨道控制器的专属配置-------
    libApp.controls.enablePan = false; // 相机平移
    libApp.controls.enableDamping = true; // 旋转阻尼
    libApp.controls.autoRotate = true; // 自动旋转
    libApp.controls.autoRotateSpeed = 0.54; // 旋转速度
    // -------轨道控制器的专属配置 END-------
    libApp.controls.minPolarAngle = 1; // 限制垂直旋转角度
    libApp.controls.maxPolarAngle = Math.PI / 1.8; // 限制垂直旋转角度
  },
  // 设置控制器2
  setControls2 () {
    libApp.controls2 = new OrbitControls( libApp.camera2, libApp.controlsDom );
    // -------轨道控制器的专属配置-------
    libApp.controls2.enablePan = false; // 相机平移
    libApp.controls2.autoRotate = false; // 自动旋转
    libApp.controls2.enableRotate = false; // 允许旋转
    // -------轨道控制器的专属配置 END-------
  },
  // 设置灯光
  setLights () {
  },
  // resize
  resizeWindow () {
    window.addEventListener('resize', () => {
      setTimeout(() => {
        let aspectRatio = libApp.controlsDom.offsetWidth / libApp.controlsDom.offsetHeight;
        libApp.camera.aspect = aspectRatio;
        libApp.camera.updateProjectionMatrix();
        libApp.renderer.setSize( libApp.controlsDom.offsetWidth, libApp.controlsDom.offsetHeight );
      });
    }, false);
  },
  // 渲染
  render () {
    this.updateOrbitsRotation();

    this.updateEarthParticlesLightUp();

    this.updateSpritesLightUp();

    this.updateLocalCloudLightUp();

    libApp.controls.update();
    libApp.renderer.clear();
    libApp.renderer.render(libApp.scene2, libApp.camera2);
    libApp.renderer.render(libApp.scene, libApp.camera);
  },
  // 加载底图,加载地球地图数据
  loaderEarth (cb) {
    this.earthImg = document.createElement('img');
    this.earthImg.src = this.texture_path + 'earth_1.png';
    this.earthImg.onload = () => {
      let earthCanvas = document.createElement('canvas');
      let earthCtx = earthCanvas.getContext('2d');
      earthCanvas.width = this.earthImg.width;
      earthCanvas.height = this.earthImg.height;
      earthCtx.drawImage(this.earthImg, 0, 0, this.earthImg.width, this.earthImg.height);
      this.earthImgData = earthCtx.getImageData(0, 0, this.earthImg.width, this.earthImg.height);

      this.createEarthParticles();

      this.createCloudGrid();

      this.createSputnikOrbits();

      this.createSprites();

      this.createCloudBlending();

      cb && cb();
    };
  },
  // 根据横纵百分比判断在底图中的像素值
  isLandByUV(c, f) {
    if (!this.earthImgData) { // 底图数据
      console.error('data error!')
    }
    let n = parseInt(this.earthImg.width * c); // 根据横纵百分比计算图象坐标系中的坐标
    let o = parseInt(this.earthImg.height * f); // 根据横纵百分比计算图象坐标系中的坐标
    return 0 === this.earthImgData.data[4 * (o * this.earthImgData.width + n)]; // 查找底图中对应像素点的rgba值并判断
  },
  // 球面打点
  createEarthParticles () {
    let positions = [];
    let materials = [];
    let sizes = [];
    for (let i = 0; i < 2; i++) {
      positions[i] = {
        positions: []
      };
      sizes[i] = {
        sizes: []
      };
      let mat = new THREE.PointsMaterial();
      mat.size = 5;
      mat.color = new THREE.Color(this.color.planet);
      mat.map = this.dotTexture;
      mat.depthWrite = false;
      mat.transparent = true;
      mat.opacity = 0;
      mat.side = THREE.FrontSide;
      mat.blending = THREE.AdditiveBlending;
      let n = i / 2;
      mat.t_ = n * Math.PI * 2;
      mat.speed_ = this.BLINT_SPEED;
      mat.min_ = .2 * Math.random() + .5;
      mat.delta_ = .1 * Math.random() + .1;
      mat.opacity_coef_ = 1;
      materials.push(mat);
    }

    let spherical = new THREE.Spherical();
    spherical.radius = this.radius;
    const step = 250;
    for (let i = 0; i < step; i++) {
      let vec = new THREE.Vector3()
      let radians = step * (1 - Math.sin(i / step * Math.PI)) / step + .5 // 每个纬线圈内的角度均分
      for (let j = 0; j < step; j += radians) {
        let c = j / step, // 底图上的横向百分比
            f = i / step, // 底图上的纵向百分比
            index = Math.floor(2 * Math.random());
        let pos = positions[index]
        let size = sizes[index]
        if (this.isLandByUV(c, f)) { // 根据横纵百分比判断在底图中的像素值
          spherical.theta = c * Math.PI * 2 - Math.PI / 2 // 横纵百分比转换为theta和phi夹角
          spherical.phi = f * Math.PI // 横纵百分比转换为theta和phi夹角
          vec.setFromSpherical(spherical) // 夹角转换为世界坐标
          pos.positions.push(vec.x)
          pos.positions.push(vec.y)
          pos.positions.push(vec.z)
          if (j % 3 === 0) {
            size.sizes.push(8.0)
          }
        }
      }
    }
    for (let i = 0; i < positions.length; i++) {
      let pos = positions[i],
          size = sizes[i],
          bufferGeom = new THREE.BufferGeometry(),
          typedArr1 = new Float32Array(pos.positions.length),
          typedArr2 = new Float32Array(size.sizes.length);
      for (let j = 0; j < pos.positions.length; j++) {
          typedArr1[j] = pos.positions[j];
      }
      for (let j = 0; j < size.sizes.length; j++) {
          typedArr2[j] = size.sizes[j];
      }
      bufferGeom.setAttribute('position', new THREE.BufferAttribute(typedArr1, 3));
      bufferGeom.setAttribute('size', new THREE.BufferAttribute(typedArr2, 1));
      bufferGeom.computeBoundingSphere();
      let particle = new THREE.Points(bufferGeom, materials[i]);
      this.earthParticles.add(particle);
    }
    this.createOceanCircle();
    libApp.scene.add(this.earthParticles);
  },
  // 更新球面点闪烁效果
  updateEarthParticlesLightUp () {
    this.earthParticles.children.forEach(obj => {
      let material = obj.material;
      material.t_ += material.speed_;
      material.opacity = (Math.sin(material.t_) * material.delta_ + material.min_) * material.opacity_coef_;
      material.needsUpdate = true;
    })
  },
  // 海洋部分填充
  createOceanCircle () {
    let createCircle = () => {
      let circle = new THREE.RingGeometry(2.4, 2.8, 32, 1);
      let mesh = new THREE.Mesh(circle, material);
      // mesh.matrixAutoUpdate = false;
      mesh.name = 'oceanCircle';
      return mesh;
    }
    let resetFromSpherical = () => {
      let utils = new THREE.Spherical();
      utils.radius = this.radius * (.97 - .01 * Math.random());
      utils.theta = x * Math.PI * 2 - Math.PI / 2;
      utils.phi = A * Math.PI;
      H.position.setFromSpherical(utils);
      // H.updateMatrix(); // 设置了mesh.matrixAutoUpdate = false; 所以需要手动更新
      H.lookAt(this.earthParticles.position);
      H.updateMatrix();
      H.updateMatrixWorld();
    }
    let material = new THREE.MeshBasicMaterial({ // 海洋部分随机圆圈
      transparent: true,
      opacity: 0.44,
      color: new THREE.Color(this.color.ocean),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide
    });
    material.name = 'oceanMaterial';
    material.t_ = 0.5 * Math.PI * 2;
    material.speed_ = this.BLINT_SPEED;
    material.min_ = .2 * Math.random() + .5;
    material.delta_ = .1 * Math.random() + .1;
    material.opacity_coef_ = 1;
    let T, x, R, A, b = new THREE.Geometry(), M = 0.01;
    b.name = 'oceanGeometry';
    let H = createCircle();
    for (let y = .5 - Math.PI; y < -.6; y += .04) {
      R = .5 * Math.cos(y) + .5;
      M = Math.abs(.01 / Math.sin(R * Math.PI));
      T = Math.floor(1 / M);
      for (let S = 0; S < T; S++) {
        x = .5 + (T / 2 - S - 0.5) * M;
        A = R;
        if (!(Math.random() > .1 || this.isLandByUV(x, A) || this.isLandByUV(x - .02, A) || this.isLandByUV(x + .02, A) || this.isLandByUV(x, A - .02) || this.isLandByUV(x, A + .02))) {
          resetFromSpherical();
          b.merge(H.geometry, H.matrixWorld);
        }
      }
    }
    let mesh = new THREE.Mesh(b, material);
    mesh.matrixAutoUpdate = false;
    mesh.name = 'oceanCircle';
    this.earthParticles.add(mesh);
  },
  // 云网格
  createCloudGrid () {
    let XRayMaterial = function(options) {
      let uniforms = {
        uTex: {
          type: "t",
          value: options.map || new THREE.Texture
        },
        offsetRepeat: {
          value: new THREE.Vector4(0, 0, 1, 1)
        },
        alphaProportion: {
          type: "1f",
          value: options.alphaProportion || .5
        },
        diffuse: {
          value: options.color || new THREE.Color(16777215)
        },
        opacity: {
          value: options.opacity || 1
        },
        gridOffset: {
          value: 0
        }
      }
      return new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: ` 
          varying float _alpha;
          varying vec2 vUv;
          uniform vec4 offsetRepeat;
          uniform float alphaProportion;
          void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          vUv = uv * offsetRepeat.zw + offsetRepeat.xy;
          vec4 worldPosition = modelMatrix * vec4( vec3( position ), 1.0 );
          vec3 cameraToVertex = normalize( cameraPosition - worldPosition.xyz);
          _alpha = 1.0 - max( 0.0, dot( normal, cameraToVertex ) );
          _alpha = max( 0.0, (_alpha - alphaProportion) / (1.0 - alphaProportion) );
        }`,
        fragmentShader: `
          uniform sampler2D uTex;
          uniform vec3 diffuse;
          uniform float opacity;
          uniform float gridOffset;
          varying float _alpha;
          varying vec2 vUv;
          void main() {
          vec4 texColor = texture2D( uTex, vUv );
          float _a = _alpha * opacity;
          if( _a <= 0.0 ) discard;
          _a = _a * ( sin( vUv.y * 2000.0 + gridOffset ) * .5 + .5 );
          gl_FragColor = vec4( texColor.rgb * diffuse, _a );
        }`,
        transparent: !0,
        blending: THREE.AdditiveBlending,
        depthTest: !1
      })
    }
    let geometry = new THREE.SphereGeometry(1.4 * this.radius, 66, 44),
        map = new THREE.TextureLoader().load(`${this.texture_path}clouds.jpg`);
    map.wrapT = THREE.ClampToEdgeWrapping;
    map.wrapS = THREE.ClampToEdgeWrapping;
    let material = new XRayMaterial({
          map: map,
          alphaProportion: .25,
          color: new THREE.Color(this.color.cloud),
          opacity: 0,
          gridOffsetSpeed: .6
        }),
        mesh = new THREE.Mesh(geometry, material);
    mesh.matrixAutoUpdate = false;
    this.cloud.add(mesh);
    libApp.scene.add(this.cloud);
  },
  // 绘制卫星和轨道
  createSputnikOrbits () {
    this.drawOrbit(6);
  },
  /**
   * 绘制卫星轨道
   * @param num {Number} 轨道数量
   * @return {Null} Null
   * @author ky 2020/11/24
   */
  drawOrbit (num) {
    let orbitGroup = new THREE.Object3D();
    orbitGroup.name = 'orbitGroup';
    let _this = this;
    function createOrbit () {
      let radius = THREE.MathUtils.randInt(_this.radius + 60, _this.radius * 1.3);
      let geometry = new THREE.RingGeometry(radius, radius + 1, 80, 1);
      let material = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.3,
        color: new THREE.Color(_this.color.planet),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      let mesh = new THREE.Mesh(geometry, material);
      return mesh;
    }
    for (let i = 0; i < num; i++) {
      let v2 = new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      let orbit = createOrbit();
      orbit.position.copy(this.earthParticles.position);
      orbit.rotation.set(v2.x, v2.y, v2.z);
      orbit._increment = new THREE.Vector3(this.getRandSides(.002), this.getRandSides(.002), this.getRandSides(.002));
      this.orbits.push(orbit);
      orbitGroup.add(orbit);
    }
    libApp.scene2.add(orbitGroup);
  },
  // 轨道的自动旋转
  updateOrbitsRotation () {
    this.orbits.forEach(item => {
      item.rotation.x += item._increment.x;
      item.rotation.y += item._increment.y;
      item.rotation.z += item._increment.z;
    });
  },
  // 空间点状粒子分布
  createSprites () {
    this.spriteGroup = new THREE.Object3D({name: 'spriteGroup'});
    let material = new THREE.SpriteMaterial({
      color: this.color.sprite,
      transparent: true,
      opacity: .2
    });
    this.getRandSpherical((spherical) => {
      let sprite = new THREE.Sprite(material);
      sprite.material = sprite.material.clone();
      sprite.material.t_ = 0.5 * Math.PI * 2;
      sprite.material.speed_ = this.BLINT_SPEED;
      sprite.material.min_ = .6 * Math.random() + .1;
      sprite.material.delta_ = .1 * Math.random() + .1;
      sprite.material.opacity_coef_ = 1;
      sprite.position.setFromSpherical(spherical);
      sprite.scale.set(1.5,1.5,1.5);
      this.spriteGroup.add(sprite);
    });
    libApp.scene2.add(this.spriteGroup);
  },
  // 空间点状粒子闪烁效果
  updateSpritesLightUp () {
    this.spriteGroup.children.forEach(obj => {
      let material = obj.material;
      material.t_ += material.speed_;
      material.opacity = (Math.sin(material.t_) * material.delta_ + material.min_) * material.opacity_coef_;
      material.needsUpdate = true;
    })
    this.spriteGroup.rotation.y += 0.001;
  },
  // 获取随机旋转数
  getRandSides (e) {
    return Math.random() * e * 2 - e;
  },
  // 获取一组随机分布于球面的位置，执行回调
  getRandSpherical (cb) {
    let T, x, R, A, M = 0.001;
    for (let y = .5 - Math.PI; y < -.6; y += .4) { // y-密度,默认0.04
      R = .5 * Math.cos(y) + .5;
      M = Math.abs(.01 / Math.sin(R * Math.PI));
      T = Math.floor(1 / M);
      for (let S = 0; S < T; S++) {
        x = .5 + (T / 2 - S - 0.5) * M;
        A = R;
        let spherical = new THREE.Spherical();
        let radius = THREE.MathUtils.randFloat(this.radius + 60, 1.8 * this.radius);
        spherical.radius = radius;
        spherical.theta = x * Math.PI * 2 - Math.PI / 2;
        spherical.phi = A * Math.PI + THREE.MathUtils.randFloatSpread(1);
        cb && cb(spherical);
      }
    }
  },
  // 添加云层图片混合效果
  createCloudBlending () {
    let geometry = new THREE.PlaneGeometry(libApp.controlsDom.offsetWidth, libApp.controlsDom.offsetHeight);
    let material = this.newLocalCloudMaterial('bg.jpg');
    let cloudBlend = new THREE.Mesh(geometry, material);
    cloudBlend.scale.set(0.72,0.72,0.72);
    cloudBlend.name = 'localCloudBlend';
    this.cloudBlendGroup.add(cloudBlend);
    this.createLocalCloudMesh('bg_fragment_left.jpg', 993, 1011, 0.62, -212, 90);
    this.createLocalCloudMesh('bg_fragment_left_1.jpg', 993, 1011, 0.62, -218, 90, 0.1);
    this.createLocalCloudMesh('bg_fragment_right.jpg', 1074, 1133, 0.6, 320, 50, 0.5);
    // this.createLocalCloudMesh(cloudBlend, 'bg_fragment_right_1.jpg', 1074, 1133);
    libApp.scene2.add(this.cloudBlendGroup);
  },
  // 创建局部云层子对象
  createLocalCloudMesh (filename, width, height, scale, offsetX, offsetY, opacityMin) {
    let w = Math.floor(width * (scale ? scale : 1));
    let h = Math.floor(height * (scale ? scale : 1));
    let geometry = new THREE.PlaneGeometry(w, h);
    let material = this.newLocalCloudMaterial(filename);
    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(offsetX, offsetY, 0);
    if (opacityMin) {
      mesh.material.t_ = 0.5 * Math.PI * 2;
      mesh.material.speed_ = this.BLINT_SPEED * .5;
      mesh.material.min_ = opacityMin * Math.random() + .1;
      mesh.material.delta_ = .1 * Math.random() + .1;
      mesh.material.opacity_coef_ = 1;
    }
    scale && mesh.scale.set(scale, scale, 1);
    this.cloudBlendGroup.add(mesh);
  },
  // 创建局部云层光效材质
  newLocalCloudMaterial (filename) {
    let material = new THREE.MeshBasicMaterial({
      fog: true,
      transparent: true,
      opacity: .7,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      color: this.color.planet,
      map: new THREE.TextureLoader().load(this.texture_path + filename)
    });
    return material;
  },
  // 更新局部云层光效闪烁
  updateLocalCloudLightUp () {
    this.cloudBlendGroup.children.forEach(obj => {
      if (obj.material.t_) {
        let material = obj.material;
        material.t_ += material.speed_;
        material.opacity = (Math.sin(material.t_) * material.delta_ + material.min_) * material.opacity_coef_;
        material.needsUpdate = true;
      }
    })
  }
}

// 动画
function animate () {
  libApp.animation = requestAnimationFrame(animate);

  gl.render();
}

export default gl;
