(function() {

  Crafty.c("TiledLevel", {
    makeTiles: function(ts, drawType) {
      var components, i, posx, posy, poly, sMap, sName, tHeight, tName, tNum, tWidth, tsHeight, tsImage, tsProperties, tsWidth, xCount, yCount, _ref, poly;
      tsImage = ts.image, tNum = ts.firstgid, tsWidth = ts.imagewidth;
      tsHeight = ts.imageheight, tWidth = ts.tilewidth, tHeight = ts.tileheight;
      tsProperties = ts.tileproperties;
      xCount = tsWidth / tWidth | 0;
      yCount = tsHeight / tHeight | 0;
      sMap = {};
      for (i = 0, _ref = yCount * xCount; i < _ref; i += 1) {
        poly = null;
        posx = i % xCount;
        posy = i / xCount | 0;
        sName = "tileSprite" + tNum;
        tName = "tile" + tNum;
        sMap[sName] = [posx, posy];
        components = "2D, " + drawType + ", " + sName + ", MapTile";
        if (tsProperties) {
        	 var realPropId = tNum - ts.firstgid;
          if (tsProperties[realPropId]) {
            if (tsProperties[realPropId]["components"]) {
              components += ", " + tsProperties[realPropId]["components"];
            }
            if (tsProperties[realPropId]["polygon"]) {
            	// simple eval to make an array
            	components += ", Collision";
            	poly = eval(tsProperties[realPropId]["polygon"]);
            	//console.log("Setting polygon on tile " + tName + " " + tsImage + "@[" + posx + "," + posy + "]");
            }
          }
        }
        Crafty.c(tName, {
          comp: components,
          poly: poly,
          init: function() {
            this.addComponent(this.comp);           
            return this;
          },
          setPosition: function(x, y) {
          	this.x = x;
          	this.y = y;
          	if (this.poly != null && this.has("Solid")) {
          		var poly = Crafty.clone(this.poly);
          		for(var point; point < poly.length; poly++) {
          			poly[point][0] += x;
				poly[point][1] += y;
          		}
          		this.collision(new Crafty.polygon(poly));
          	}
          	return this;
          }
        });
        tNum++;
      }
      Crafty.sprite(tWidth, tHeight, tsImage, sMap);
      return null;
    },
    makeLayer: function(layer) {
      var i, lData, lHeight, lWidth, tDatum, tile, _len, lProps;
      lData = layer.data, lWidth = layer.width, lHeight = layer.height, lProps = layer.properties;
      for (i = 0, _len = lData.length; i < _len; i++) {
        tDatum = lData[i];
        if (tDatum) {
         components = "tile" + tDatum;
         if (lProps) {
            if (lProps["components"]) {
               components += ", " + lProps["components"];
             }
          }

         tile = Crafty.e(components);
			var x = (i % lWidth) * tile.w;
        	var y = (i / lWidth | 0) * tile.h;
        	tile.setPosition(x, y);
        }
      }
      return null;
    },
    tiledLevel: function(levelURL, drawType, callback) {
      var _this = this;
      $.ajax({
        type: 'GET',
        url: levelURL,
        dataType: 'json',
        data: {},
        async: false,
        success: function(level) {
          var lLayers, ts, tsImages, tss;
          lLayers = level.layers, tss = level.tilesets;
          drawType = drawType != null ? drawType : "Canvas";
          tsImages = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = tss.length; _i < _len; _i++) {
              ts = tss[_i];
              _results.push(ts.image);
            }
            return _results;
          })();
          Crafty.load(tsImages, function() {
            var layer, ts, _i, _j, _len, _len2;
            for (_i = 0, _len = tss.length; _i < _len; _i++) {
              ts = tss[_i];
              _this.makeTiles(ts, drawType);
            }
            for (_j = 0, _len2 = lLayers.length; _j < _len2; _j++) {
              layer = lLayers[_j];
              _this.makeLayer(layer);
            }
            
            // Correct the map boundaries since Crafty isn't report this correctly
            Crafty.map.boundaries = function() {
													return {
														max: { x: level.width * level.tilewidth, y: level.height * level.tileheight },
														min: { x: 0, y: 0 }
													};
												}
            return null;
          });
          return null;
        }
      });
	if (callback != undefined) callback();
      return this;
    },
    init: function() {
      return this;
    }
  });

}).call(this);
