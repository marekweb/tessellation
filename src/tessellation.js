/* eslint-env node, browser */

(function () {
  class Tessellation {
    constructor({canvas, tpr = 50}) {
      if (canvas === null) {
        throw new Error('Missing option: canvas');
      }

      this.canvas = canvas;
      this.ctx = this.canvas.getContext('2d');

      var width = this.canvas.width + 1;
      var height = this.canvas.height + 1;

      this.trianglesPerRow = Math.floor(width / tpr);
      this.triangleSide = width / this.trianglesPerRow;
      this.columnWidth = Math.sqrt(3) * this.triangleSide / 2;

      // this.xOffset = (this.columnWidth - (width % this.columnWidth)) / 2;
      // this.yOffset = (this.triangleSide - (height % this.triangleSide)) /2;
      this.xOffset = 0;
      this.yOffset = 0;

      this.rows = Math.ceil(height / this.triangleSide * 2) + 1;
      this.columns = Math.ceil(width / this.columnWidth);

      this.grid = new Array(this.columns * this.rows);
      this.dirty = new Array(Math.ceil(this.columns * this.rows / 32));
      this.color = new Array(this.columns * this.rows);

      for (var c = 0; c < this.columns; c++) {
        for (var r = 0; r < this.rows; r++) {
          var p = this.coordinatedToPoints(c, r);
          this.grid[r * this.columns + c] = p;
        }
      }
    }

    render() {
      var j = Math.floor(Math.random() * this.grid.length);
      this.dirty[j] = true;

      for (var i = 0; i < this.grid.length; i++) {
        if (this.dirty[i]) {
          this.drawTriangle(this.grid[i]);
          this.dirty[i] = false;
        }
      }

      this.drawCenter();
    }

    drawCenter() {
      this.ctx.beginPath();
      this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 10, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    randomTriangle() {
      return [rand(this.columns), rand(this.rows)];
    }

    drawTriangle(points) {
      this.ctx.beginPath();
      this.ctx.moveTo(points[0], points[1]);
      this.ctx.lineTo(points[2], points[3]);
      this.ctx.lineTo(points[4], points[5]);
      this.ctx.closePath();
      this.ctx.strokeStyle = 'black';
      this.ctx.lineWidth = 4;
      this.ctx.fillStyle = 'hsl(' + Math.floor(Math.random() * 360) + ', 40%, 80%)';
      this.ctx.fill();
    }

    createTriangle(x, y) {
      var points = [
        x,
        y,

        x,
        y + this.triangleSide,

        x + this.columnWidth,
        y + this.triangleSide / 2
      ];
      this.offsetPoints(points);
      return points;
    }

    offsetPoints(points) {
      for (var i = 0; i < points.length; i++) {
        if (i % 2) {
          points[i] -= this.yOffset;
        } else {
          points[i] -= this.xOffset;
        }
      }
    }

    createInvertedTriangle(x, y) {
      var points = [
        x + this.columnWidth,
        y,

        x + this.columnWidth,
        y + this.triangleSide,

        x,
        y + this.triangleSide / 2
      ];
      this.offsetPoints(points);
      return points;
    }

    coordinatedToPoints(tx, ty) {
      var y = (ty - 1) * this.triangleSide / 2;
      var x = tx * this.columnWidth;
      if ((tx + ty) % 2) {
        return this.createTriangle(x, y);
      }
      return this.createInvertedTriangle(x, y);
    }
  }

  function rand(n) {
    return Math.floor(Math.random() * n);
  }

  if (typeof module !== 'undefined') {
    module.exports = Tessellation;
  }

  if (typeof window !== 'undefined') {
    window.Tessellation = Tessellation;
  }
})();
