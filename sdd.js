$.getJSON("examples/out/pixelart_2.json", function (json) {
    const matrices = load_json(json); // this will show the info it in firebug console

    var slider = document.querySelector('input')

    var ctx = document.getElementById('canvas').getContext('2d')

    console.log(matrices)

    let image = new ImageData(matrices[matrices.length - 1], 512, 512)
    ctx.putImageData(image, 0, 0)


    slider.addEventListener('change', () => {
        let image = new ImageData(matrices[slider.value - 1], 512, 512)
        ctx.putImageData(image, 0, 0)

        let layer = document.getElementById('layers')
        let size = document.getElementById('size')

        layer.textContent = `Displaying ${slider.value} Layers`
        size.textContent = `Image Size: ~${Number((387*slider.value + 3*512)/1000).toFixed(2)}KB`
        
    })

});

function load_json(input) {

    // Construct Red, Green and Blue matrix
    let red = calculate_matrix(input['red'], input['mean']['red'])
    let green = calculate_matrix(input['green'], input['mean']['green'])
    let blue = calculate_matrix(input['blue'], input['mean']['blue'])

    var output = new Array(red.length)
    console.log('building layers')
    var prev_layers = new Array(red[0].length)
    for (let i = 0; i < red[0].length; i++) {
        prev_layers[i] = new Array(red[0][0].length)
        for (let j = 0; j < red[0][0].length; j++) {
            prev_layers[i][j] = [input['mean']['red'][j], input['mean']['green'][j], input['mean']['blue'][j]]
        }
    }
    for (let l = 0; l < output.length; l++) {
        var layer = new Uint8ClampedArray(red[l].length * red[l][0].length * 4);

        let c = 0 // counter
        for (let i = 0; i < red[l].length; i++) {
            for (let j = 0; j < red[l][0].length; j++) {

                prev_layers[i][j][0] += red[l][i][j]
                prev_layers[i][j][1] += green[l][i][j]
                prev_layers[i][j][2] += blue[l][i][j]


                layer[c] = Math.min(255, Math.max(0, prev_layers[i][j][0]))
                c++

                layer[c] = Math.min(255, Math.max(0, prev_layers[i][j][1]))
                c++

                layer[c] = Math.min(255, Math.max(0, prev_layers[i][j][2]))
                c++
                layer[c++] = 255
            }
        }

        output[l] = layer
        console.log('\t finished', l)
    }

    return output
}

function calculate_matrix(input) {
    X = input[0]
    D = input[1]
    Y = input[2]

    // x * d * y
    // console.log(Y)
    var layers = new Array(D.length)
    for (let l = 0; l < layers.length; l++) {
        let A = new Array(X.length)
        for (let i = 0; i < X.length; i++) {
            A[i] = new Array(Y[0].length)
            for (let j = 0; j < Y[0].length; j++) {
                A[i][j] = X[i][l] * Y[l][j] * D[l]
            }
        }
        layers[l] = A
    }

    return layers
}