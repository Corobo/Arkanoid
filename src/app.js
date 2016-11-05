
var nivelActual = 1;

var GameLayer = cc.Layer.extend({
    spritePelota:null,
    velocidadX:null,
    velocidadY:null,
    spriteBarra:null,
    keyPulsada: null,
    arrayBloques:[],
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
        //Creacion sprite bloque
        //this.spriteBloque = cc.Sprite.create(res.cocodrilo_1_png);
        //this.spriteBloque.setPosition(cc.p(this.spriteBloque.width/2 ,
        //      size.height - this.spriteBloque.height/2 ));
        //this.addChild(this.spriteBloque);
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

        //var actionMoverPelota = cc.MoveTo.create(1, cc.p(size.width, size.height));
        //this.spritePelota.runAction(actionMoverPelota);

        //var actionMoverPelota = cc.MoveBy.create(1, cc.p(100, 0));
        //this.spritePelota.runAction(actionMoverPelota);

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

            alert("Pulsado ");
            console.log(event.getLocationX());
            console.log(event.getLocationY());

            var actionMoverPelotaAPunto =
                cc.MoveTo.create(1,
                        cc.p(event.getLocationX(),
                        event.getLocationY()));
            //Eliminar acciones previas
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

        //Calcular colision bloque
        //var areaBloque = this.spriteBloque.getBoundingBox();
        //if( cc.rectIntersectsRect(areaPelota, areaBloque)){
          //  console.log("Colision");
            //this.removeChild(this.spriteBloque);
        //}

        //Calcular colisiones bloques
        var destruido = false;
        for(var i = 0; i < this.arrayBloques.length; i++){
             var areaBloque = this.arrayBloques[i].getBoundingBox();
             if( cc.rectIntersectsRect(areaPelota, areaBloque)){
                this.removeChild(this.arrayBloques[i]);
                this.arrayBloques.splice(i, 1);
                console.log("Quedan : "+this.arrayBloques.length);
                destruido = true;
                //Ampliacion niveles
                if(this.arrayBloques.length==0){
                    nivelActual++;
                    cc.director.pause();
                    this.addChild(new GameWinLayer());
                }
             }
        }
        if(destruido){
            this.velocidadX = this.velocidadX*-1;
            this.velocidadY = this.velocidadY*-1;
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
            var insertados = 0;
            var fila = 0;
            var columna = 0;
            var constanteAumento = 5;

            while (insertados < nivel*constanteAumento){
                //Ampliacion
                var modelo = Math.floor((Math.random() * 3) + 1);
                //Frames bloque ^^ fuera
                var framesBloque = [];
                 for (var i = 1; i <= 8; i++) {
                    if(modelo==1)
                        var str = "cocodrilo" + i + ".png";
                    if(modelo==2)
                        var str = "panda" + i + ".png";
                    if(modelo==3)
                        var str = "tigre" + i + ".png";
                    var frame = cc.spriteFrameCache.getSpriteFrame(str);
                    framesBloque.push(frame);
                 }
                var animacionBloque = new cc.Animation(framesBloque, 0.1);
                var accionAnimacionBloque =
                          new cc.RepeatForever(new cc.Animate(animacionBloque));
                //Cargar sprite
                //var spriteBloqueActual = new cc.Sprite("#cocodrilo1.png");
                //spriteBloqueActual.runAction(accionAnimacionBloque);
                //Ampliacion bloques diferentes
                switch (modelo) {
                    case 1:
                        var spriteBloqueActual = new cc.Sprite("#cocodrilo1.png");
                        break;
                    case 2:
                        var spriteBloqueActual = new cc.Sprite("#panda1.png");
                        break;
                    case 3:
                        var spriteBloqueActual = new cc.Sprite("#tigre1.png");
                        break;
                }

                spriteBloqueActual.runAction(accionAnimacionBloque);


                var x = ( spriteBloqueActual.width / 2 ) +
                              ( spriteBloqueActual.width * columna );
                var y = (cc.winSize.height - spriteBloqueActual.height/2 ) -
                              ( spriteBloqueActual.height * fila );
                console.log("Insertado en: "+x+" ,"+y);

                spriteBloqueActual.setPosition(cc.p(x,y));

                this.arrayBloques.push(spriteBloqueActual);
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

