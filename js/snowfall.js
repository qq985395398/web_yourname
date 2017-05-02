var snowFall = (function () {

    var SCREEN_WIDTH,
        SCREEN_HEIGHT,
        buffer1, buffer2, buffer3, buffer4, buffer5,
        bufferArray = [],
        snow,
        ctx,
        lingrad,
        MAX_PARTICLES,
        MAX_FLAKE_SIZE = 50,
        particles = [],
        a = 0;

    // shim layer
    var requestAnimFrame = (function () {
        return  window.requestAnimationFrame   ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function (callback) {
                window.setTimeout(callback, 1000 / 16);
            };
    }());

    function fr(n) { return n * Math.random(); }

    function createBuffer() {
        return document.createElement('canvas');
    }

    function setup() {
        var size, i;
        // generate the particles in order from smallest to largest so the larger overlay the smaller
        // also there should be many more smaller particles than larger - cubic
        for (i = 0; i < MAX_PARTICLES; i++) {
            size = i < MAX_PARTICLES * 0.6 ? 0 : i < MAX_PARTICLES * 0.8 ? 1 : i < MAX_PARTICLES * 0.9 ? 2 : i < MAX_PARTICLES * 0.98 ? 3 : 4;
            particles[i] = [fr(SCREEN_WIDTH), fr(SCREEN_HEIGHT), size];
        }
    }

    function update() {
        var i, s, s2, part;

        a += 0.01;
        s = Math.sin(a);
        for (i = 0; i < MAX_PARTICLES; i++) {
            part = particles[i];
            s2 = Math.sin(4 * a + i);
            part[1] += part[2] / 2 + (2 + s2);
            part[0] += 6 * (s + (s2 / 2)) / (10 / part[2]);
            if (part[1] > SCREEN_HEIGHT) {
                part[1] = -MAX_FLAKE_SIZE;
                // randomise the screen position on re-entry
                part[0] = fr(SCREEN_WIDTH);
            }
            if (part[0] > SCREEN_WIDTH || part[0] < -MAX_FLAKE_SIZE) {
                if (s > 0) {
                    part[0] = -MAX_FLAKE_SIZE;
                } else {
                    part[0] = SCREEN_WIDTH;
                }
            }
            particles[i] = part;
        }
    }

    function draw() {
        var i;

        // clear the background
        ctx.fillStyle = lingrad;
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        ctx.beginPath();
        for (i = 0; i < MAX_PARTICLES; i++) {
            ctx.drawImage(bufferArray[particles[i][2]], particles[i][0], particles[i][1]);
        }
        ctx.fill();
        update();
    }

    function resizeHandler() {
        SCREEN_WIDTH = window.innerWidth;
        SCREEN_HEIGHT = window.innerHeight;
        if (snow !== undefined) {
            snow.width = SCREEN_WIDTH;
            snow.height = SCREEN_HEIGHT;
            MAX_PARTICLES = SCREEN_WIDTH * SCREEN_HEIGHT / 5000;
            // create a linear gradient for the background
            lingrad = ctx.createLinearGradient(0, 0, 0, SCREEN_HEIGHT);
            lingrad.addColorStop(0, '#101018');
            lingrad.addColorStop(0.66, '#505055');
            lingrad.addColorStop(0.7, '#525252');
            lingrad.addColorStop(0.74, '#505550');
            lingrad.addColorStop(1, '#646964');
            setup();
        }
    }

    function init() {

        window.addEventListener('resize', snowFall.resizeHandler, false);

        snow = document.createElement('canvas');
        snow.style.position = 'fixed';
        snow.style.top =  '0px';
        snow.style.left = '0px';
        snow.style.zIndex = -5000;
        snow.id = 'canvas_snow';
        document.body.appendChild(snow);

        ctx = snow.getContext('2d');
        ctx.strokeStyle = 'none';

        // create the buffers
        buffer1 = createBuffer();
        buffer2 = createBuffer();
        buffer3 = createBuffer();
        buffer4 = createBuffer();
        buffer5 = createBuffer();

        bufferArray = [buffer1, buffer2, buffer3, buffer4, buffer5];

        // fill the buffers with some 'snow flakes'
        snowFlake({
            canvas: buffer1,
            width: MAX_FLAKE_SIZE * 0.2,
            height: MAX_FLAKE_SIZE * 0.2,
            color: '#646464',
            soft: 0.05
        });
        snowFlake({
            canvas: buffer2,
            width: MAX_FLAKE_SIZE * 0.3,
            height: MAX_FLAKE_SIZE * 0.3,
            color: '#969696',
            soft: 0.05
        });
        snowFlake({
            canvas: buffer3,
            width: MAX_FLAKE_SIZE * 0.3,
            height: MAX_FLAKE_SIZE * 0.3,
            color: '#C8C8C8',
            soft: 0.3
        });
        snowFlake({
            canvas: buffer4,
            width: MAX_FLAKE_SIZE * 0.6,
            height: MAX_FLAKE_SIZE * 0.6,
            color: '#EBEBEB',
            soft: 0.2
        });
        snowFlake({
            canvas: buffer5,
            width: MAX_FLAKE_SIZE,
            height: MAX_FLAKE_SIZE,
            color: '#FFF',
            soft: 0.05
        });

        resizeHandler(null);

        // target 20 frames/second
        setInterval(function () {requestAnimFrame(snowFall.draw); }, 1000 / 20);
    }


    function snowFlake(parameters) {
        var canvas, mainCtx, imageWidth, imageHeight,
            imageWidth2, imageHeight2,
            soft, color,
            grd;

        imageWidth    = parameters.width || 30;
        imageHeight   = parameters.height || 30;
        imageWidth2   = imageWidth / 2;
        imageHeight2  = imageHeight / 2;
        color         = parameters.color || '#FFF';
        soft          = parameters.soft || 0;

        canvas = parameters.canvas;
        canvas.width  = imageWidth;
        canvas.height = imageWidth;

        mainCtx = canvas.getContext('2d');
        mainCtx.clearRect(0, 0, imageWidth, imageHeight);

        grd = mainCtx.createRadialGradient(imageWidth2, imageHeight2, 0, imageWidth2, imageHeight2, imageWidth2);
        grd.addColorStop(0, color);
        grd.addColorStop(0.1, color);
        grd.addColorStop(0.85, RGBtoRGBA(color, soft));
        grd.addColorStop(1, RGBtoRGBA(color, 0));
        mainCtx.fillStyle = grd;
        mainCtx.fillRect(0, 0, imageWidth, imageHeight);

    }

    function RGBtoRGBA(s, a) {
        var r, g, b;
        s = s.replace(/^\s*#|\s*$/g, '');
        if (s.length === 3) {
            s = s.replace(/([0-9a-fA-F])/g, '$1$1');
        }
        g = parseInt(s.substr(2, 2), 16);
        b = parseInt(s.substr(4, 2), 16);
        r = parseInt(s.substr(0, 2), 16);
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
    }

    return {
        init : init,
        draw : draw,
        resizeHandler : resizeHandler
    };
}());


// Prevent the script running on phone devices
if (!(/iphone|ipad|ipod|android|blackberry|mini|webos|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()))) {
    window.onload = snowFall.init();
}