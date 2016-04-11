jQuery.widget('llapgoch.centipede', {
    options: {
        stageWidth: 500,
        stageHeight: 500,
        startPointX: 100,
        startPointY: 100,
        minDiameter: 20,
        maxDiameter: 300,
        minDegrees: 1,
        maxDegrees: 300,
        speed: 1
    },
    
    canvas: null,
    currentArc: {},
    ctx: null,
    currentX: 0,
    currentY: 0,
    currentRotation: 0,
    currentCos: 0,
    currentSin: 0,
    currentDiameter: 100,
    
    _create: function(){
        var canvas =  $('<canvas />', {
            width: this.options.stageWidth,
            height: this.options.stageHeight
        });
        
        this.element.append(canvas);
        
        this.canvas = canvas.get(0);
        this.canvas.width = this.options.stageWidth;
        this.canvas.height = this.options.stageHeight;

        this.ctx = this.canvas.getContext('2d');
        
        this.currentX = this.options.startPointX;
        this.currentY = this.options.startPointY;

        for(var i = 0; i < 20; i++){
            this._createArc();
        }
    },
    
    _degreesToRadians: function(deg){
        return deg * 0.0174533;
    },
    
    _rotatePoint: function($pPoint, $pOrigin, rot){
        var $rp = [];
        var radians = (rot / 180) * Math.PI;

        $rp['x'] = $pOrigin['x'] + (Math.cos(radians) * ($pPoint['x'] - $pOrigin['x']) - Math.sin(radians) * ($pPoint['y'] - $pOrigin['y']));
        $rp['y'] = $pOrigin['y'] + (Math.sin(radians) * ($pPoint['x'] - $pOrigin['x']) + Math.cos(radians) * ($pPoint['y'] - $pOrigin['y']));

        return $rp;
    },
    
    _isOnStage: function(x, y){
        return (x > 0 && x < this.options.stageWidth) &&
                (y > 0 && y < this.options.stageHeight);
    },
    
    _createArc: function(){
       
        
        var diameter,
            degreeRange,
            direction,
            numberOfDegrees,
            endRad,
            isOnStage,
        centerPoint;
            
        
        var c = 0;
        
        do{
            diameter = (Math.random() * (this.options.maxDiameter - this.options.minDiameter)) + this.options.minDiameter;
            direction = Math.random() >= 0.5 ? -1 : 1;
            numberOfDegrees = ((Math.random() * (this.options.maxDegrees - this.options.minDegrees)) + this.options.minDegrees) * direction;
            diameter *= direction;
            
            centerX = this.currentX + ((diameter / 2));
            centerY = this.currentY;
            
            centerPoint = this._rotatePoint(
                {
                    x: centerX,
                    y: centerY
                },
                {
                    x: this.currentX,
                    y: this.currentY
                },
                this.currentRotation
            );
            
            endRad = this._degreesToRadians(this.currentRotation + numberOfDegrees - 180);
            endPosY = Math.sin(endRad) * (diameter / 2) + centerPoint.y;
            endPosX = Math.cos(endRad) * (diameter / 2) + centerPoint.x;
            isOnStage = this._isOnStage(endPosX, endPosY);
            
            c++;
            
            if(c > 500){
                console.log(endPosX, endPosY);
                console.log("error");
                break;
            }
            
        } while(isOnStage == false);
        
        
        var circumference = (Math.PI * diameter);
        var distance = (circumference / 360) * numberOfDegrees;
        var steps = distance / this.options.speed; 
        var angleStep = numberOfDegrees / steps;
        
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(centerPoint.x, centerPoint.y, 2, 2);
        this.ctx.fill();
        
        
        for(i = 0; i < steps; i++){
            var val = i * angleStep;
            
            var rad = this._degreesToRadians(this.currentRotation + val - 180);
            var posY = Math.sin(rad) * (diameter / 2) + centerPoint.y;
            var posX = Math.cos(rad) * (diameter / 2) + centerPoint.x;

            this.ctx.fillRect(posX, posY, 2, 2);
            this.ctx.fill();
            
        }
        
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.currentX, this.currentY, 4, 4);
        this.ctx.fill();
        
        this.currentRotation += numberOfDegrees;
        this.currentX = posX;
        this.currentY = posY;
        
    }
});