/* eslint-env node, browser */

(function () {
  class Tessellation {
    constructor({canvas, tpr = 50}) {
      if (typeof canvas === 'string') {
        canvas = document.getElementById();
      }

      if (!canvas) {
        throw new Error('Missing or invalid option: canvas');
      }

      this.canvas = canvas;
      this.ctx = this.canvas.getContext('2d');

      var width = this.canvas.width + 1;
      var height = this.canvas.height + 1;

      this.trianglesPerRow = Math.floor(width / tpr);
      this.triangleSide = width / this.trianglesPerRow;
      this.columnWidth = Math.sqrt(3) * this.triangleSide / 2;

      this.xOffset = width / 2;
      this.yOffset = height / 2;

      this.gridOffsetY = Math.ceil(height / this.triangleSide) + 2;
      this.rows = this.gridOffsetY * 4;

      this.gridOffsetX = Math.ceil(width / this.columnWidth / 2);
      this.columns = this.gridOffsetX * 2;

      this.grid = this.constructGrid(this.rows, this.columns);
    }

    constructGrid(w, h) {
      var grid = [];
      for (var x = 0; x < h; x++) {
        var row = [];
        for (var y = 0; y < w; y++) {
          row.push({
            color: 'rgba(0, 0, 0, 0)',
            dirty: false,
            points: this.coordinatedToPoints(x, y)
          });
        }
        grid.push(row);
      }
      return grid;
    }

    render() {
      for (var x = 0; x < this.columns; x++) {
        for (var y = 0; y < this.rows; y++) {
          var t = this.grid[x][y];

          if (t.dirty) {
            this.drawTriangle(t.points, t.color);
            this.drawLabel([x - this.gridOffsetX, y - this.gridOffsetY].join(','), t.points);
            t.dirty = false;
          }
        }
      }
    }

    drawCenter() {
      this.ctx.beginPath();
      this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 10, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    drawTriangle(points, color) {
      this.ctx.beginPath();
      this.ctx.moveTo(points[0], points[1]);
      this.ctx.lineTo(points[2], points[3]);
      this.ctx.lineTo(points[4], points[5]);
      this.ctx.closePath();
      this.ctx.fillStyle = color;
      this.ctx.fill();
    }

    drawLabel(t, points) {
      this.ctx.fillStyle = 'black';
      this.ctx.font = '8px monospace';
      this.ctx.fillText(t, (points[0] + points[2] + points[4]) / 3 - 4 * t.length, (points[1] + points[3] + points[5]) / 3);
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
          points[i] = (points[i] + this.yOffset | 0);
        } else {
          points[i] = (points[i] + this.xOffset | 0);
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
      tx -= this.gridOffsetX;
      ty -= this.gridOffsetY;

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
