"use strict";

var canvas;
var gl;
var program;
var points = [];

var NumTimesToSubdivide = 3;
var DrawingMode = 1;
var Theta = 0;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // Configure WebGL (viewport and clear color)
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    // Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // moved vertices, data loading, shading variables to compute_points function
    // Compute the points/triangles then render them
    compute_points();

    // Initialize event handlers

    // drawing mode menu
    var drawingSelect = document.getElementById("drawing");
    drawingSelect.selectedIndex = DrawingMode;
    drawingSelect.onchange = function( )
    {
        DrawingMode = parseInt(document.getElementById("drawing").selectedIndex);
        compute_points();
        render();
    };

    // twist angle slider
    var twistAngSlider = document.getElementById("twist_ang");
    twistAngSlider.value = Theta;
    // NOTE: using the oninput event for the sliders makes it more dynamic
    // than using the onchange one
    twistAngSlider.oninput = function( )
    {
        Theta = parseFloat(document.getElementById("twist_ang").value);
        compute_points();
        render();
    };

    // tesselation slider
    var tessLevSlider = document.getElementById("tess_lev");
    tessLevSlider.value = NumTimesToSubdivide;
    tessLevSlider.oninput = function( )
    {
        NumTimesToSubdivide = parseFloat(document.getElementById("tess_lev").value);
        compute_points();
        render();
    };

    render();
};

function triangle( a, b, c )
{
    points.push( a, b, c );
}

function divideTriangle( a, b, c, count )
{
    // check for end of recursion

    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        if (DrawingMode === 2){
            divideTriangle(ab, ac, bc, count)
        }
        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    if(DrawingMode === 0) {
        for (let i = 0; i < points.length; i += 3) {
            gl.drawArrays(gl.LINE_LOOP, i, 3);
        }
    }
    else {
        gl.drawArrays(gl.TRIANGLES, 0, points.length);
    }
}

function compute_points()
{
    // Clear the points array
    points = [];

    // The 2D vertices of the figure
    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    // triangle
    divideTriangle( vertices[0], vertices[1], vertices[2], NumTimesToSubdivide );

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
}
