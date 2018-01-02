//@author: chuter

;(function(root, NB) {

  'use strict';

  var $ = root.$;
  var AppContext = root.AppContext;
  var Surfaces = NB.Surfaces;

  function renderForm(onSubmit) {
    var form = new NB.Component.NBForm({
      el: document.querySelector('[ref="formContainer"]')
    });

    form.render({onSubmit: onSubmit});
  }

  function prepareToUpload(submitData) {
    AppContext.submit = submitData;
    Surfaces.next(function() {
      $('[ref="editorOverlay"]').addClass('active');
    });
  }

  renderForm(prepareToUpload);


  function buildImgEditor() {
    var ImgEditor = (function() {
      var container = document.querySelector('[ref="imgEditorCanvasContainer"]');
      var canvas = document.getElementById('imgEditor');
      var clipperCanvas = document.getElementById('imgClipper');
      var clipperCtx = clipperCanvas.getContext('2d');
      var scale = 1;

      var dw = canvas.width = container.clientWidth;
      var dh = canvas.height = container.clientHeight;
      var editorOverlay = document.querySelector('[ref="editorOverlay"]');
      var imgStage = new createjs.Stage(canvas);
      var bitmapX;
      var bitmapY;

      function check(file) {
        var fileName = file.name;
        var extStart = fileName.lastIndexOf('.');
        var ext = fileName.substring(extStart, fileName.length).toUpperCase();
        if (ext != '.BMP' && ext != '.PNG' && ext != '.GIF' && ext != '.JPG' && ext != '.JPEG') {
          alert('请选择图片文件');
          return false;
        }

        return true;
      }

      function scaleImg(img) {
        if (!(img.width >= dw && img.height >= dh)) {
          var sW = dw / img.width;
          var sH = dh / img.height;
          scale = sW <= sH ? sW : sH;
          if (!(img.width*scale >= dw && img.height*scale >= dh)) {
            scale = sW + sH - scale;
          }
        }
      }

      function bindOpActions(bitmap) {
        touch.on(editorOverlay, 'touchstart', function(event) {
          event.preventDefault();
        });

        var preScale = scale;
        var curScale;
        var rotation = 0;
        var dx = bitmapX;
        var dy = bitmapY;

        touch.on(editorOverlay, 'drag', function(event) {
          dx = dx || 0;
          dy = dy || 0;
          var offx = dx + event.x;
          var offy = dy + event.y;
          bitmap.x = offx;
          bitmap.y = offy;
          imgStage.update();
        });

        touch.on(editorOverlay, 'dragend', function(event) {
          dx += event.x;
          dy += event.y;
        });

        touch.on(editorOverlay, 'pinch', function(event) {
          if (event.scale === undefined) {
            return;
          }
          curScale = preScale + event.scale - 1;
          curScale = curScale < 0.1 ? 0.1 : curScale;
          bitmap.scaleX = curScale;
          bitmap.scaleY = curScale;

          imgStage.update();
        });

        touch.on(editorOverlay, 'pinchend', function(event) {
          preScale = curScale;
        });

        touch.on(editorOverlay, 'rotate', function(event) {
          if (event.rotation === undefined) {
            return;
          }

          var _rotation = rotation + event.rotation;
          if (event.fingerStatus === 'end') {
            rotation += event.rotation;
          }
          bitmap.rotation = _rotation;
          imgStage.update();
        });
      }

      function edit() {
        var url = clipperCanvas.toDataURL('jpg');
        var img = new Image();

        img.src = url;
        clipperCtx.clearRect(0, 0, dw, dh);

        img.onload = function() {
          var bitmap = new createjs.Bitmap(url);

          scaleImg(img);
          clipperCanvas.width = dw;
          clipperCanvas.height = dh;
          bitmapX = dw / 2;
          bitmapY = dh / 2;

          bitmap.set({
            x: -img.width*2,
            y: -img.height*2,
            regX: img.width/2,
            regY: img.height/2,
            scaleX: scale,
            scaleY: scale
          });
          imgStage.addChild(bitmap);
          imgStage.update();

          setTimeout(function() {
            bitmap.x = bitmapX;
            bitmap.y = bitmapY;
            imgStage.update();
          }, 500);

          bindOpActions(bitmap);
        }
      }

      var _prop = {
        dumpImg: function() {
          var src = canvas.toDataURL('image/png');
          var resultImg = new Image();
          resultImg.src = src;

          return resultImg;
        },

        clear: function() {
          imgStage.removeAllChildren();
          imgStage.clear();
        },

        load: function(file) {
          if (!check(file)) {
            return;
          }

          EXIF.getData(file, function() {
            var rate = EXIF.getTag(this, "Orientation");
            var mpImg = new MegaPixImage(file);

            if (rate !== 6 && rate !== 8) {
              rate = 1;
            }
            mpImg.render(clipperCanvas, {
              maxWidth: dw,
              maxHeight: dh,
              quality: 0.5,
              orientation: rate
            }, edit);
          });
        },
      };

      return _prop;
    }());

    return ImgEditor;
  }
  
  $('[data-action="upload-image"]').click(function(event) {
    event.stopPropagation();

    var isFiring = false;

    $('[ref="uploadImg"]').click();
    $('[ref="uploadImg"]').on('change', function(event) {
      if (isFiring) {
        return false;
      }
      isFiring = true;

      Surfaces.next(function() {
        var ImgEditor = AppContext.ImgEditor;
        if (ImgEditor === undefined) {
          ImgEditor = AppContext.ImgEditor = buildImgEditor();
        } else {
          ImgEditor.clear();
        }

        var file = event.target.files[0];
        if (file) {
          ImgEditor.load(file);
        }
      });
    });
  });


  function TextDrawer(options) {
    this.swidth = options.swidth;
    this.sheight = options.sheight;
    this.context = options.context;
    this.canvas = options.canvas;

    this.dx = options.sdx/this.swidth*this.canvas.width;
    this.dy = options.sdy/this.sheight*this.canvas.height;

    this.curX = this.dx;
    this.curY = this.dy;

    this.lineSpanHeight = options.lineSpanHeight||15;
  }
  TextDrawer.prototype = {
    constructor: TextDrawer,

    _convertFontSize: function(fontSize) {
      return fontSize*(this.canvas.height/this.sheight);
    },

    newLine: function(nextLineMaxFontSize) {
      this.curX = this.dx;
      this.curY += this.lineSpanHeight+this._convertFontSize(nextLineMaxFontSize);
      return this;
    },

    drawText: function(text, fontSize, fontFamily, color) {
      var _drawFontSize = this._convertFontSize(fontSize);
      this.context.font = _drawFontSize+'px '+fontFamily;
      this.context.fillStyle = color||'#000';
      this.context.fillText(text, this.curX, this.curY);

      this.curX += this.context.measureText(text).width;
      return this;
    },
  }


  function buildImgGenerator() {
    var ImgGenerator = (function() {
      var swidth = 640;
      var sheight = 1038;

      var logoImgSwidth = 125;
      var logoImgSheight = 127;
      var logoImgSRight = 20;
      var logoImgSy = 75;

      var dborderXWidth = 20;
      var dborderYWidth = 24;

      var mainTextSx = 60;
      var mainTextSy = 489;

      var personTextSx = 339;
      var personTextSy = 806; 

      var canvasContainer = document.querySelector('[ref="resultContainer"]');
      var canvas = document.querySelector('.sreen-canvas');
      var context = canvas.getContext('2d');

      canvas.width = canvasContainer.clientWidth;
      canvas.height = canvasContainer.clientHeight;

      var orverlayEl = document.querySelector('[ref="overlay"]');
      var targetImg = document.querySelector('[ref="targetImg"]');

      function drawLayerImg(cb) {
        var layer = new Image();
        layer.src = 'img/layer.png';

        layer.onload = function() {
          context.drawImage(layer, 0, 0, canvas.width, canvas.height);

          if (cb) {
            cb();
          }
        };
      }

      function drawLogoImg(cb) {
        var logoDWidth = logoImgSwidth/swidth*canvas.width;
        var logoDHeight = logoImgSheight/sheight*canvas.height;
        var dx = canvas.width-dborderXWidth-logoDWidth-logoImgSRight/swidth*canvas.width;
        var dy = logoImgSy/sheight*canvas.height;

        var logo = new Image();
        logo.src = 'img/logo.png';
        logo.onload = function() {
          context.drawImage(
            logo, 0, 0, logoImgSwidth, logoImgSheight, 
            dx, dy, logoDWidth, logoDHeight
          );
          if (cb) {
            cb();
          }
        }
      }

      function buildSubmitTextDrawer(context, canvas, lineSpanHeight, sdx, sdy) {
        return new TextDrawer({
          swidth: swidth,
          sheight: sheight,
          context: context,
          canvas: canvas,
          lineSpanHeight: lineSpanHeight,
          sdx: sdx,
          sdy: sdy
        });
      }

      function drawOutward(drawer, fontFamily) {
        var outward = AppContext.submit.outward;
        var highLightPos = outward.lastIndexOf('很');
        var hignLightText;
        var normalText = outward;

        if (highLightPos > 3) {
          normalText = outward.substring(0, highLightPos);
          hignLightText = outward.substring(highLightPos);
        }

        drawer.drawText(normalText, 48, fontFamily);
        if (hignLightText) {
          drawer.drawText(hignLightText, 58, fontFamily, 'rgb(230,1,0)');
        }
        drawer.drawText('。', 48, fontFamily);
      }

      function drawMettle(drawer, fontFamily) {
        var mettle = AppContext.submit.mettle;
        var highLightPos = mettle.lastIndexOf('只有');
        var hignLightText;
        var normalText = mettle;

        if (highLightPos > 3) {
          normalText = mettle.substring(0, highLightPos);
          hignLightText = mettle.substring(highLightPos);
        }

        if (hignLightText) {
          drawer.newLine(36);
        } else {
          drawer.newLine(28);
        }

        drawer.drawText(normalText, 28, fontFamily);
        if (hignLightText) {
          drawer.drawText(hignLightText, 36, fontFamily, 'rgb(230,1,0)');
        }
        drawer.drawText('。', 28, fontFamily);
      }

      function drawMainText() {
        var _textDrawer = buildSubmitTextDrawer(
          context, canvas, 15, mainTextSx+dborderXWidth, mainTextSy
        );
        var fontFamily = 'MFLangSong';

        drawOutward(_textDrawer, fontFamily);
        drawMettle(_textDrawer, fontFamily);

        _textDrawer.newLine(24).drawText(
          AppContext.submit.achieve, 24, fontFamily
        );
      }

      function drawPersonText() {
        var _textDrawer = buildSubmitTextDrawer(
          context, canvas, 15, personTextSx+dborderXWidth, personTextSy+dborderYWidth
        );
        var fontFamily = '新蒂小丸子体';
        _textDrawer.drawText(
          AppContext.submit.company, 25, fontFamily
        ).newLine(25).drawText(
          AppContext.submit.title, 25, fontFamily
        ).newLine(25).drawText(
          AppContext.submit.name, 25, fontFamily
        );
      }

      var _props = {
        preview: function(cb) {
          var ImgEditor = AppContext.ImgEditor;
          var uploadImg = ImgEditor.dumpImg();

          orverlayEl.classList.remove('active');
          context.clearRect(0, 0, canvas.width, canvas.height);

          if (!uploadImg) {
            drawLayerImg(function() {
              drawLogoImg(function() {
                drawMainText();
                drawPersonText();
                if (cb) {
                  cb();
                }
              });
            });
          } else {
            uploadImg.onload = function() {
              context.drawImage(
                uploadImg,
                0,
                0,
                uploadImg.width,
                uploadImg.height,
                dborderXWidth,
                dborderYWidth,
                canvas.width-2*dborderXWidth,
                canvas.height-2*dborderYWidth
              );

              drawLayerImg(function() {
                drawLogoImg(function() {
                  drawMainText();
                  drawPersonText();
                  if (cb) {
                    cb();
                  }
                });
              });
            };
          }
        },

        generate: function() {
          this.preview(function() {
            orverlayEl.classList.add('active');
            targetImg.src = canvas.toDataURL('image/png', 1);
          });
        }
      };

      return _props
    }());

    return ImgGenerator;
  }

  $('[data-action="preview"]').click(function() {
    Surfaces.next(function() {
      var ImgGenerator = AppContext.ImgGenerator;
      if (ImgGenerator === undefined) {
        ImgGenerator = AppContext.ImgGenerator = buildImgGenerator();
      }

      ImgGenerator.preview();
    });
  });

  $('[data-action="generate"]').click(function() {
    Surfaces.next(function() {
      var ImgGenerator = AppContext.ImgGenerator;
      if (ImgGenerator === undefined) {
        ImgGenerator = AppContext.ImgGenerator = buildImgGenerator();
      }

      ImgGenerator.generate();
    });
  });

  $('[data-action="edit-image"]').click(function() {
    $('[ref="editorOverlay"]').removeClass('active');
  });

  document.addEventListener('touchmove', function(event) {
    event.stopPropagation();
    event.preventDefault();
    return false;
  });

}(self, NB));