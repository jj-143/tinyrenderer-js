# Tiny Renderer in JS
A JavaScript implementation of [TinyRenderer](https://github.com/ssloy/tinyrenderer) based on the [wiki](https://github.com/ssloy/tinyrenderer/wiki)
to understand how OpenGL works. [Live Demo](https://github.com/jj-143/tinyrenderer-js/docs/)

### PROGRESS
- [x] Lesson 1 - Bresenham’s Line Drawing Algorithm
- [x] Lesson 2 - Triangle rasterization and back face culling
- [x] Lesson 3 - Hidden faces removal (z buffer)
- [x] Lesson 4 - Perspective projection
- [x] Lesson 5 - Moving the camera
- [x] Lesson 6 - Shaders for the software renderer
- [x] Lesson 6bis - tangent space normal mapping
- [x] Lesson 7 - Shadow mapping
- [x] Lesson 8 - Ambient occlusion

### TODO
- [ ] refine two-pass rendering process (depth)
- [ ] [Demo] add shader picker
- [ ] [Demo] add light position slider
- [ ] [Demo] add model picker
- [ ] possible performance gain from matrix with 1-D TypedArray,
      opposed to 2-D Array?