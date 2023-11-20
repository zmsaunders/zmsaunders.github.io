var heart = function(container, canvas) {
    this.canvasSelector = canvas;
    this.containerSelector = container;

    this.canvas = null; // The canvas Object
    this.context = null; // Canvas Context
    this.width = 0; // Canvas Width
    this.height = 0; // Canvas Height
    this.lines = []; // Line Objects
    this.mouse = false;
    this.scale = 1;
    this.targetWidth = 500;
    this.targetHeight = 440;
    // Initalize and run
    this.init();
};

heart.prototype = {
    init() {
        // Store some vars
        this.canvas = document.getElementById(this.canvasSelector);
        // Don't do anything if the canvas was never found.
        if (! this.canvas) {
            return;
        }

        this.width = document.getElementById(this.containerSelector).scrollWidth;
        this.height = document.getElementById(this.containerSelector).scrollHeight;

        // Set the canvas height and width to that of the container.
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Build the lines
        this.addLines(60);
        this.context = this.canvas.getContext("2d");

        // Bind Events
        this.bindResize();
        this.bindMouse();
        this.updateContext();

        // Star the render loop.
        window.AnimationQueue.addAnimation(function() {
            this.render();
        }.bind(this), 60);
    },

    addLines(count) {
        // Build each line
        for (let i = 0; i < count; i++) {

            var line;
            var topPoint = function(x) {
                return -0.45 * (Math.abs(x) - Math.sqrt(Math.abs(x)**2 - 4 * x**2 + 12));
            }

            var bottomPoint = function(x) {
                return -0.45 * (Math.sqrt(Math.abs(x)**2 - 4 * x**2 + 12) + Math.abs(x));
            }

            var x = (i*4/count)-1.98;

            line = {
                x1 : (x + 2) * 120,
                x2 : (x + 2) * 120,
                y1 : (topPoint(x)+ 2) * 120,
                y2 : (bottomPoint(x)+ 2) * 120,
                weight : (x >= 0) ? ((i%2) + 1) : 1,
                v1 : Math.random() * 2 - 1,
                v2 : Math.random() * 2 - 1
            };

            if (line.weight == 2 && x > 0) {
                line.y1 = line.y1 + 5;
                line.y2 = line.y2 - 5;
            }

            line['dx1'] = Math.random() * this.canvas.width;
            line['dx2'] = Math.random() * this.canvas.width;
            line['dy1'] = Math.random() * this.canvas.height;
            line['dy2'] = Math.random() * this.canvas.height;

            this.lines.push(line);
        }
    },

    drawLines() {
        let ctx = this.context;

        for (let i = 0; i < this.lines.length; i++) {
            let line = this.lines[i];
            ctx.beginPath();
            ctx.strokeStyle = "rgba(108,108,108," + (line.weight * .4)+ ")";
            ctx.lineWidth = line.weight;
            ctx.lineCap = 'round';
            ctx.moveTo(line.dx1 * this.scale, line.dy1 * this.scale);
            ctx.lineTo(line.dx2 * this.scale, line.dy2 * this.scale);
            ctx.stroke();

            if (! this.mouse) {
                // Drift...
                line.dx1 += line.v1 / 10;
                line.dy1 += line.v2 / 10;
                line.dx2 += line.v2 / 10;
                line.dy2 += line.v1 / 10;

                if (line.dx1 < 0 || line.dy2 < 0) {
                    line.v1 = line.v1 * -1;
                }
                if (line.dx1 > this.targetWidth || line.dy2 > this.targetHeight) {
                    line.v1 = line.v1 * -1;
                }

                if (line.dy1 < 0 || line.dx2 < 0) {
                    line.v2 = line.v2 * -1;
                }

                if (line.dx2 > this.targetWidth || line.dy1 > this.targetHeight) {
                    line.v2 = line.v2 * -1;
                }

            } else {
                // come back!
                let mult = 1 + (40/line.x1);
                line.dx1 = line.x1 + ((line.dx1 - line.x1) / mult);
                line.dy1 = line.y1 + ((line.dy1 - line.y1) / mult);
                line.dx2 = line.x2 + ((line.dx2 - line.x2) / mult);
                line.dy2 = line.y2 + ((line.dy2 - line.y2) / mult);
            }

            this.lines[i] = line;
        }
    },

    bindResize() {
        window.addEventListener('resize', function() {this.updateContext()}.bind(this));
    },

    bindMouse() {
        document.getElementById(this.containerSelector).addEventListener('mouseover', function() {
            this.mouse = true;
        }.bind(this));

        document.getElementById(this.containerSelector).addEventListener('mouseout', function() {
            this.mouse = false;
        }.bind(this));
    },

    updateContext() {
        this.width = document.getElementById(this.containerSelector).scrollWidth;
        this.height = document.getElementById(this.containerSelector).scrollHeight;
        var canvas = document.getElementById(this.canvasSelector);
        if (! canvas) {
            return;
        }

        this.scale = this.width / this.targetWidth;
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext("2d");

    },


    render() {
        // Skip render if off the page.
        if ((this.canvas.getBoundingClientRect().top - 10) > window.innerHeight) {
            return;
        }
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawLines();

    }
};

var inLove = new heart('container', 'canvas');
