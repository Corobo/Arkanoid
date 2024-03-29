
var nivelActual = 1;

var GameLayer = cc.Layer.extend({
    spritePelota:null,
    velocidadX:null,
    velocidadY:null,
    spriteBarra:null,
    keyPulsada: null,
    arrayBloques:[],
    arrayTnts:[],
    arrayPowerUp:[],
    arrayPowerDown:[],
    sizePlataforma:1,
    ctor:function () {
        this._super();
        var size = cc.winSize;

        this.velocidadX = 6;
        this.velocidadY = 3;

        //Creacion sprite pelota
        this.spritePelota = cc.Sprite.create(res.bola_png);
        this.spritePelota.setPosition(cc.p(size.width/2 , size.height/2));
        this.addChild(this.spritePelota);
        //Creacion sprite barra
        this.spriteBarra = cc.Sprite.create(res.barra_2_png);
        this.spriteBarra.setPosition(cc.p(size.width/2 , size.height*0.1 ));
        this.addChild(this.spriteBarra);
        //Creacion del fondo
        var spriteFondo = cc.Sprite.create(res.fondo_png);
        spriteFondo.setPosition(cc.p(size.width/2 , size.height/2));
        spriteFondo.setScale( size.width / spriteFondo.width );
        this.addChild(spriteFondo,-1);


        //cachear spriteBloques
        cc.spriteFrameCache.addSpriteFrames(res.animacioncocodrilo_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animacionpanda_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animaciontigre_plist);



        //Creacion de los bloques
        this.inicializarBloques(nivelActual);


        var actionMoverPelota1 = cc.MoveBy.create(1, cc.p(100, 0));
        var actionMoverPelota2 = cc.MoveBy.create(1, cc.p(0, 100));
        var secuencia = cc.Sequence.create(actionMoverPelota1,actionMoverPelota2);
        this.spritePelota.runAction(secuencia);

        //Listener para las pusalciones
        cc.eventManager.addListener({
           event: cc.EventListener.MOUSE,
           onMouseDown: this.procesarMouseDown
        }, this)
        //Listener para pulsaciones teclado
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed:  function(keyCode, event){
                var actionMoverBarraX = null;
                var instancia = event.getCurrentTarget();

                if(instancia.keyPulsada == keyCode)
                            return;

                instancia.keyPulsada = keyCode;

                if( keyCode == 37){
                    console.log("Ir izquierda ");
                      actionMoverBarraX =
                        cc.MoveTo.create(Math.abs(instancia.spriteBarra.x - 0)/500,
                        cc.p(0,cc.winSize.height*0.1));
                }

                if( keyCode == 39){
                     console.log("Ir derecha ");
                      actionMoverBarraX =
                       cc.MoveTo.create(Math.abs(instancia.spriteBarra.x - cc.winSize.width)/500,
                       cc.p(cc.winSize.width,cc.winSize.height*0.1));
                }

                cc.director.getActionManager().
                    removeAllActionsFromTarget(instancia.spriteBarra, true);

                if( actionMoverBarraX != null)
                     instancia.spriteBarra.runAction(actionMoverBarraX);

            },
            onKeyReleased: function(keyCode, event){
                if(keyCode == 37 || keyCode == 39){
                      var instancia = event.getCurrentTarget();
                      instancia.keyPulsada = null;
                      cc.director.getActionManager().
                        removeAllActionsFromTarget(instancia.spriteBarra, true);
                }
            }
        }, this);

        this.scheduleUpdate();

        return true;
    },procesarMouseDown:function(event) {
            // Ambito procesarMouseDown
            var instancia = event.getCurrentTarget(); // para coger objetos de otro ambito

            console.log(event.getLocationX());
            console.log(event.getLocationY());


            cc.director.getActionManager().removeAllActionsFromTarget(instancia.spriteBarra, true);
            var actionMoverBarraX =
                cc.MoveTo.create(Math.abs(instancia.spriteBarra.x -
                event.getLocationX())/500,
                        cc.p(event.getLocationX(),
                         cc.winSize.height*0.1));

            instancia.spriteBarra.runAction(actionMoverBarraX);

    },update:function (dt) {
        var mitadAncho = this.spritePelota.getContentSize().width/2;
        var mitadAlto = this.spritePelota.getContentSize().height/2;

        // Nuevas posiciones
        this.spritePelota.x = this.spritePelota.x + this.velocidadX;
        this.spritePelota.y = this.spritePelota.y + this.velocidadY;

        //Colisiones
        var areaPelota = this.spritePelota.getBoundingBox();
        var areaBarra = this.spriteBarra.getBoundingBox();

        if( cc.rectIntersectsRect(areaPelota, areaBarra)){
            console.log("Colision");
            this.velocidadX = ( this.spritePelota.x - this.spriteBarra.x ) / 5;
            this.velocidadY =  this.velocidadY*-1;
        }

        //Calcular colisiones bloques
        var destruido = false;
        var bloqueDestruido;
        for(var i = 0; i < this.arrayBloques.length; i++){
             var areaBloque = this.arrayBloques[i].getBoundingBox();
             if( cc.rectIntersectsRect(areaPelota, areaBloque)){
                bloqueDestruido = this.arrayBloques[i];
                this.removeChild(this.arrayBloques[i]);
                this.arrayBloques.splice(i, 1);
                console.log("Quedan : "+this.arrayBloques.length);
                destruido = true;
             }
        }
        var aDestruir = [];
        if(destruido){
            this.velocidadX = this.velocidadX*-1;
            this.velocidadY = this.velocidadY*-1;
            var it=0;
            for(var i=0;i<this.arrayTnts.length;i++){
                var tnt = this.arrayTnts[i];
                if(tnt.x == bloqueDestruido.x && tnt.y==bloqueDestruido.y){
                    for(var j=0; j<this.arrayBloques.length;j++){
                        if(this.arrayBloques[j].x==tnt.x-40 && this.arrayBloques[j].y==tnt.y-40){
                            aDestruir[it]=this.arrayBloques[j]; it++;
                            }
                        if(this.arrayBloques[j].x==tnt.x && this.arrayBloques[j].y==tnt.y-40){
                            aDestruir[it]=this.arrayBloques[j]; it++;
                            }
                        if(this.arrayBloques[j].x==tnt.x+40 && this.arrayBloques[j].y==tnt.y-40){
                            aDestruir[it]=this.arrayBloques[j]; it++;
                            }
                        if(this.arrayBloques[j].x==tnt.x-40 && this.arrayBloques[j].y==tnt.y){
                            aDestruir[it]=this.arrayBloques[j]; it++;
                            }
                        if(this.arrayBloques[j].x==tnt.x+40 && this.arrayBloques[j].y==tnt.y){
                            aDestruir[it]=this.arrayBloques[j]; it++;
                            }
                        if(this.arrayBloques[j].x==tnt.x-40 && this.arrayBloques[j].y==tnt.y+40){
                            aDestruir[it]=this.arrayBloques[j]; it++;
                            }
                        if(this.arrayBloques[j].x==tnt.x && this.arrayBloques[j].y==tnt.y+40){
                            aDestruir[it]=this.arrayBloques[j]; it++;
                            }
                        if(this.arrayBloques[j].x==tnt.x+40 && this.arrayBloques[j].y==tnt.y+40){
                            aDestruir[it]=this.arrayBloques[j]; it++;
                            }
                    }
                }
            }
            for(var i=0;i<aDestruir.length;i++){
                var lugar=-1;
                var bloqueADestruir = aDestruir[i];
                for(var j = 0 ; j<this.arrayBloques.length;j++){
                    var bloqueBuscado = this.arrayBloques[j];
                    if(bloqueADestruir.x == bloqueBuscado.x  && bloqueADestruir.y == bloqueBuscado.y)
                        lugar=j;
               }
               if(lugar!=-1){
                this.removeChild(this.arrayBloques[lugar]);
                this.arrayBloques.splice(lugar,1);
                }
            }
            for(var i=0; i<this.arrayPowerUp.length;i++){
                var powerUp = this.arrayPowerUp[i];
                if(bloqueDestruido.x==powerUp.x && bloqueDestruido.y==powerUp.y){
                   if(this.sizePlataforma==1){
                        var xBarra = this.spriteBarra.x + this.velocidadX;
                        var yBarra = this.spriteBarra.y + this.velocidadY;
                        this.removeChild(this.spriteBarra);
                        this.spriteBarra = cc.Sprite.create(res.barra_3_png);
                        this.spriteBarra.setPosition(cc.p(xBarra , yBarra ));
                        this.addChild(this.spriteBarra);
                        this.sizePlataforma=2;
                    }
                    if(this.sizePlataforma==0){
                        var xBarra = this.spriteBarra.x + this.velocidadX;
                        var yBarra = this.spriteBarra.y + this.velocidadY;
                        this.removeChild(this.spriteBarra);
                        this.spriteBarra = cc.Sprite.create(res.barra_2_png);
                        this.spriteBarra.setPosition(cc.p(xBarra , yBarra ));
                        this.addChild(this.spriteBarra);
                        this.sizePlataforma=1;
                    }
                }
            }
            for(var i=0; i<this.arrayPowerDown.length;i++){
                var powerDown = this.arrayPowerDown[i];
                if(bloqueDestruido.x==powerDown.x && bloqueDestruido.y==powerDown.y){
                   if(this.sizePlataforma==1){
                       var xBarra = this.spriteBarra.x + this.velocidadX;
                       var yBarra = this.spriteBarra.y + this.velocidadY;
                       this.removeChild(this.spriteBarra);
                       this.spriteBarra = cc.Sprite.create(res.barra_1_png);
                       this.spriteBarra.setPosition(cc.p(xBarra , yBarra ));
                       this.addChild(this.spriteBarra);
                       this.sizePlataforma=0;
                   }
                   if(this.sizePlataforma==2){
                       var xBarra = this.spriteBarra.x + this.velocidadX;
                       var yBarra = this.spriteBarra.y + this.velocidadY;
                       this.removeChild(this.spriteBarra);
                       this.spriteBarra = cc.Sprite.create(res.barra_2_png);
                       this.spriteBarra.setPosition(cc.p(xBarra , yBarra ));
                       this.addChild(this.spriteBarra);
                      this.sizePlataforma=1;
                   }
                }
            }
        }

        //Ampliacion niveles
        if(this.arrayBloques.length==0){
            nivelActual++;
            cc.director.pause();
            this.addChild(new GameWinLayer());
        }

        // Rebote
        if (this.spritePelota.x < 0 + mitadAncho){
             this.spritePelota.x = 0 + mitadAncho;
             this.velocidadX = this.velocidadX*-1;
        }
        if (this.spritePelota.x > cc.winSize.width - mitadAncho){
             this.spritePelota.x = cc.winSize.width - mitadAncho;
             this.velocidadX = this.velocidadX*-1;
        }
        if (this.spritePelota.y < 0 + mitadAlto){
           // No rebota, se acaba el juego
             cc.director.pause();
             cc.audioEngine.stopMusic();
             this.addChild(new GameOverLayer());
        }
        if (this.spritePelota.y > cc.winSize.height - mitadAlto){
             this.spritePelota.y = cc.winSize.height - mitadAlto;
             this.velocidadY = this.velocidadY*-1;
        }
    },inicializarBloques:function(nivel) {
            this.arrayBloques =[];
            this.arrayTnts = [];
            this.arrayPowerUp = [];
            var insertados = 0;
            var fila = 0;
            var columna = 0;
            var constanteAumento = 5;
            var framesBloqueCocodrilo = [];
            var framesBloquePanda = [];
            var framesBloqueTigre = [];
             for (var i = 1; i <= 8; i++) {
                var strCocodrilo = "cocodrilo" + i + ".png";
                var strPanda = "panda" + i + ".png";
                var strTigre = "tigre" + i + ".png";
                var framesCocodrilo = cc.spriteFrameCache.getSpriteFrame(strCocodrilo);
                var framesPanda = cc.spriteFrameCache.getSpriteFrame(strPanda);
                var framesTigre = cc.spriteFrameCache.getSpriteFrame(strTigre);
                framesBloqueCocodrilo.push(framesCocodrilo);
                framesBloquePanda.push(framesPanda);
                framesBloqueTigre.push(framesTigre);
             }
            while (insertados < nivel*constanteAumento){
                var modelo = Math.floor((Math.random() * 6) + 1);

                //Ampliacion bloques diferentes
                switch (modelo) {
                    case 1:
                        var animacionBloque = new cc.Animation(framesBloqueCocodrilo, 0.1);
                        var accionAnimacionBloque =
                                  new cc.RepeatForever(new cc.Animate(animacionBloque));
                        var spriteBloqueActual = new cc.Sprite("#cocodrilo1.png");
                        break;
                    case 2:
                        var animacionBloque = new cc.Animation(framesBloquePanda, 0.1);
                        var accionAnimacionBloque =
                                  new cc.RepeatForever(new cc.Animate(animacionBloque));
                        var spriteBloqueActual = new cc.Sprite("#panda1.png");
                        break;
                    case 3:
                        var animacionBloque = new cc.Animation(framesBloqueTigre, 0.1);
                        var accionAnimacionBloque =
                                  new cc.RepeatForever(new cc.Animate(animacionBloque));
                        var spriteBloqueActual = new cc.Sprite("#tigre1.png");
                    case 4:
                        var spriteBloqueActual = cc.Sprite.create(res.tnt);
                        break;
                    case 5:
                        var spriteBloqueActual = cc.Sprite.create(res.power_up);
                        break;
                    case 6:
                        var spriteBloqueActual = cc.Sprite.create(res.power_down);
                        break;
                }
                if(modelo!=4 && modelo!=5 && modelo!=6)
                    spriteBloqueActual.runAction(accionAnimacionBloque);


                var x = ( spriteBloqueActual.width / 2 ) +
                              ( spriteBloqueActual.width * columna );
                var y = (cc.winSize.height - spriteBloqueActual.height/2 ) -
                              ( spriteBloqueActual.height * fila );
                console.log("Insertado en: "+x+" ,"+y);

                spriteBloqueActual.setPosition(cc.p(x,y));

                this.arrayBloques.push(spriteBloqueActual);
                if(modelo==4)
                    this.arrayTnts.push(spriteBloqueActual);
                if(modelo==5)
                    this.arrayPowerUp.push(spriteBloqueActual);
                if(modelo==6)
                    this.arrayPowerDown.push(spriteBloqueActual);
                this.addChild(spriteBloqueActual);

                insertados++;
                columna++;

                if( x + spriteBloqueActual.width / 2 > cc.winSize.width){
                  columna = 0;
                  fila++;

                }
            }
       }

});

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        cc.director.resume();
        cc.audioEngine.playMusic(res.sonidobucle_wav, true);
        var layer = new GameLayer();
        this.addChild(layer);
    }
});

