function Scene3d(canvasId) {
    this.canvasId = canvasId;
    this.init();
    this.redraw();
}

Scene3d.prototype.init = function() {
    var canvas = document.getElementById(this.canvasId);
    this.ctx = canvas.getContext('2d');
    this.w = canvas.width;
    this.h = canvas.height;
    this.sz = 100;
    this.ht = 1;
    this.vis = 80;
    this.scrDist = 0.3;
    this.scrHalf = 0.1;
    this.initField(100);

    var self = this;
    canvas.onmousedown = function() { self.mouseDown(); };
    canvas.onmouseup = function() { self.mouseUp(); };
    setInterval(function() {self.onTimer()}, 70);
}

Scene3d.prototype.initField = function(n) {
    this.x = this.sz / 2;
    this.y = this.sz / 2;
    this.dir = 0;
    this.field = [];
    for (var i = 0; i < this.sz; i++) {
        this.field.push({type: 2, x: i, y: 0, h: 1.5});
        this.field.push({type: 2, x: i + 1, y: this.sz, h: 1.5});
        this.field.push({type: 2, x: 0, y: i + 1, h: 1.5});
        this.field.push({type: 2, x: this.sz, y: i, h: 1.5});
    }
    for (var j = 0; j < n; j++) {
        var x = Math.random() * this.sz;
        var y = Math.random() * this.sz;
        this.field.push({type: 1, x: x, y: y, h: 2.5});
    }
}

Scene3d.prototype.redraw = function() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.w, this.h);
    var objects = this.rotate(this.filterVisible());
    for (var i in objects) {
        var obj = objects[i];
        var da = -Math.atan2(obj.y, obj.x);
        var sx = Math.tan(da) * this.scrDist;
        var k = this.scrDist / obj.x;
        var sh = obj.h * k;
        var sy = -this.ht * k;
        this.drawObject(obj, sx, sy, sh);
    }
}

Scene3d.prototype.drawObject = function(obj, sx, sy, sh) {
    var scrHalfH = this.scrHalf * this.h / this.w
    var x = Math.round((sx + this.scrHalf) * this.w / (this.scrHalf * 2));
    var y1 = Math.round((-sy + scrHalfH) * this.h / (scrHalfH * 2));
    var y2 = Math.round((-(sh + sy) + scrHalfH) * this.h / (scrHalfH * 2));
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = obj.type == 1 ? '#66ff66' : '#8800ff';
    this.ctx.beginPath();
    this.ctx.moveTo(x, y1);
    this.ctx.lineTo(x, y2);
    this.ctx.stroke();
}

Scene3d.prototype.filterVisible = function() {
    var da = Math.atan(this.scrHalf / this.scrDist);
    var res = [];
    for (var i in this.field) {
        var obj = this.field[i];
        var dist = Math.hypot(obj.y - this.y, obj.x - this.x);
        if (dist > this.scrDist && dist < this.vis && Math.abs(this.angleTo(obj.x, obj.y)) < da) {
            res.push(obj);
        }
    }
    return res;
}

Scene3d.prototype.rotate = function(objs) {
    var res = [];
    for (var i in objs) {
        var obj = objs[i];
        var x = obj.x - this.x;
        var y = obj.y - this.y;
        var nx = Math.cos(this.dir) * x + Math.sin(this.dir) * y;
        var ny = Math.cos(this.dir) * y - Math.sin(this.dir) * x;
        res.push({type: obj.type, h: obj.h, x: nx, y: ny});
    }
    return res;
}

Scene3d.prototype.angleTo = function(x, y) {
    var dir = Math.atan2(y - this.y, x - this.x);
    dir -= this.dir;
    while (dir >= Math.PI) {
        dir -= 2 * Math.PI;
    }
    while (dir < -Math.PI) {
        dir += 2 * Math.PI;
    }
    return dir;
}

Scene3d.prototype.onTimer = function() {
    if (!this.move) {
        return;
    }
    if (this.move == 'F') {
        var step = 0.3;
        this.x += step * Math.cos(this.dir);
        this.y += step * Math.sin(this.dir);
    } else if (this.move == 'L') {
        this.dir += 0.01;
    } else {
        this.dir -= 0.01;
    }
    this.redraw();
}

Scene3d.prototype.mouseDown = function() {
    var sect = (event.offsetX * 7 / this.w);
    if (sect < 2) {
        this.move = 'L';
    } else if (sect > 5) {
        this.move = 'R';
    } else {
        this.move = 'F';
    }
}

Scene3d.prototype.mouseUp = function() {
    this.move = null;
}
