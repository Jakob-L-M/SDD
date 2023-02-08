var matrices;
var d;
const slider = document.getElementById('slider_input')
const ctx = document.getElementById('sdd_canvas').getContext('2d')
var currentPicture = 'boat'

slider.addEventListener('change', () => {
    let image = new ImageData(matrices[slider.value - 1], 512, 512)
    ctx.putImageData(image, 0, 0)

    let layer = document.getElementById('layers')
    let size = document.getElementById('size')

    layer.textContent = `Displaying ${slider.value} Layers | Weight of last Layer: ${d[slider.value - 1]}`
    size.textContent = `Image Size: ~${Number((387 * slider.value + 3 * 512) / 1000).toFixed(2)}KB`

})

function change_picture(pictureName) {

    document.getElementById('loading').style.visibility = 'visible'
    document.getElementById('interactions').style.visibility = 'hidden'

    document.getElementById(currentPicture).style.boxShadow = '0vmin 0vmin 0.45vw 0.45vw gray'
    document.getElementById(pictureName).style.boxShadow = '0vmin 0vmin 0.45vw 0.45vw rgb(27, 180, 27)'

    let initialPos = document.getElementById('slider_input').value

    $.getJSON(`SDD/examples/out/${pictureName}.json`, function (json) {
        let input = load_json(json); // this will show the info it in firebug console
        let new_matrices = input[0]
        let new_importance = input[1]

        let image = new ImageData(new_matrices[initialPos - 1], 512, 512)
        ctx.putImageData(image, 0, 0)

        document.getElementById('layers').textContent = `Displaying ${initialPos} Layers`
        document.getElementById('size').textContent = `Image Size: ~${Number((387 * initialPos + 3 * 512) / 1000).toFixed(2)}KB`

        // original Image
        let originalPicture = new Image();
        let orgCtx = document.getElementById('original_canvas').getContext('2d');
        originalPicture.src = `SDD/examples/in/${pictureName}.png`; // can also be a remote URL e.g. http://
        originalPicture.onload = function () {
            orgCtx.drawImage(originalPicture, 0, 0);
        };
        
        set_matrices(new_matrices, new_importance)

        document.getElementById('loading').style.visibility = 'hidden'
        document.getElementById('interactions').style.visibility = 'visible'

        currentPicture = pictureName

    });
}

function set_matrices(new_matrices, new_importance) {
    console.log('Done')
    matrices = new_matrices
    d = new_importance
    let layer = document.getElementById('layers')
    let size = document.getElementById('size')

    layer.textContent = `Displaying ${slider.value} Layers | Weight of last Layer: ${d[slider.value - 1]}`
    size.textContent = `Image Size: ~${Number((387 * slider.value + 3 * 512) / 1000).toFixed(2)}KB`
}

function load_json(input) {

    // Construct Red, Green and Blue matrix
    let red = calculate_matrix(input['red'], input['mean']['red'])
    let green = calculate_matrix(input['green'], input['mean']['green'])
    let blue = calculate_matrix(input['blue'], input['mean']['blue'])

    var importance = []
    for (let i = 0; i < input['mean']['red'].length; i++) {
        importance.push(Math.max(input['red'][1][i], input['green'][1][i], input['blue'][1][i]))
    }

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
        // console.log('\t finished', l)
    }

    return [output, importance]
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

change_picture(currentPicture, 50)