var Game = {
	SPEED: 2,
	WIDTH: 600,
	HEIGHT: 500,
	SPRITE_SIZE: 40,
	SPRITE_MARGIN: 7,
	_player: null,
	init: function(width, height) {
		Game.WIDTH = width;
		Game.HEIGHT = height;
		
		Crafty.init(Game.WIDTH, Game.HEIGHT);
				
		Game._createPlayerComponent();
		Game._createControlsComponent();
	},
	showLoadingScreen: function() {
		 // Black background with some loading text
	    Crafty.background("#000");
	    return Crafty.e("2D, DOM, Text")
					.attr({w: 100, h: 20, x: Game.WIDTH/2 - 50, y: Game.HEIGHT/2 - 60})
	     			.text("Loading...")
  			      	.css({"text-align": "center"});
	},
	setPlayer: function(player) {
		if (player == null && Game._player != null)
			Game._player.destroy();
		Game._player = player;
	},
	loadMap: function(level, loaded) {
	
		for (sprite in level.sprites) {
			Game.loadSprite(level.sprites[sprite]);
		}

		var realLoaded = function() {
				var player = Crafty.e("2D, DOM, Player, LeftControls, Collision")
					        .attr({ x: level.startPosition.x, y: level.startPosition.y, z: 10 })
					        .leftControls(Game.SPEED)
					        .collision([Game.SPRITE_MARGIN, 20], 
					        				 [Game.SPRITE_MARGIN, Game.SPRITE_SIZE],
					        				 [Game.SPRITE_SIZE - Game.SPRITE_MARGIN, Game.SPRITE_SIZE],
					        				 [Game.SPRITE_SIZE - Game.SPRITE_MARGIN, 20])
					        .player();
	        				
		      Game.setPlayer(player);
		      
				Crafty.viewport.follow(player);
		
				loaded();
		};		
		
		Crafty.e("TiledLevel")
				.tiledLevel(level.map, "DOM", realLoaded);
	},
	loadSprite: function(sprite) {
		Crafty.sprite(sprite.size, sprite.url, sprite.spritemap);
	},
	_createPlayerComponent: function() {
		Crafty.c('Player', {
		    player: function() {
		      //setup animations
		      this.requires("SpriteAnimation, Collision, Grid, PlayerSprite") 
	   			.animate("walk_down", 0, 0, 4)
		            	.animate("walk_left", 0, 1, 4)
		            	.animate("walk_up", 0, 2, 4)
		            	.animate("walk_right", 0, 3, 4)
			   		.bind("NewDirection", function (direction) {
			        		if (direction.x < 0) {
			            			if (!this.isPlaying("walk_left"))
			                			this.stop().animate("walk_left", 10, -1);
			        		}
			        		if (direction.x > 0) {
			            			if (!this.isPlaying("walk_right"))
			                			this.stop().animate("walk_right", 10, -1);
			        		}
			        		if (direction.y < 0) {
			            			if (!this.isPlaying("walk_up"))
			                			this.stop().animate("walk_up", 10, -1);
			        		}
			        		if (direction.y > 0) {
			            			if (!this.isPlaying("walk_down"))
			                			this.stop().animate("walk_down", 10, -1);
			        		}
			        		if(!direction.x && !direction.y) {
			            			this.stop();
			        		}
					})
					.bind('Moved', function(from) {
				 		var realX = this.x + Crafty.viewport.x;
				 		var realY = this.y + Crafty.viewport.y;
				 		var collisions = this.hit('Solid');
			    			if(collisions
			    					|| this.x < 0 || this.y < 0
			    					|| this.x > (Crafty.map.boundaries().max.x - Game.SPRITE_SIZE) 
			    					|| this.y > (Crafty.map.boundaries().max.y - Game.SPRITE_SIZE) ){
			        			this.attr({x: from.x, y:from.y});
			    			}
						})
						return this;	
					}
				});
	},
	_createControlsComponent: function() {
		Crafty.c("LeftControls", {
		    init: function() {
		        this.requires('Multiway');
		    },
		    
		    leftControls: function(speed) {
		        this.multiway(speed, {W: -90, S: 90, D: 0, A: 180})
		        return this;
		    }
		    
		});
	}
};

var GameSprite = function(size, url, spritemap) {
	this.size = size;
	this.url = url;
	this.spritemap = spritemap;	
}

GameSprite.prototype.size = Game.SPRITE_SIZE;
GameSprite.prototype.url = "";
GameSprite.prototype.spritemap = {};

var GameLevel = function(map, sprites, startPosition) {
	this.map = map;
	this.sprites = sprites;
	this.startPosition = startPosition;
};

GameLevel.prototype.map = "";
GameLevel.prototype.sprites = [];
GameLevel.prototype.startPosition = { x: 0, y: 0};
