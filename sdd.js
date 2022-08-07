$.getJSON("examples/out/boat.json", function (json) {
    let image_bitMap = load_json(json); // this will show the info it in firebug console

    var image = new ImageData(image_bitMap, 512, 512)
    var ctx = document.getElementById('canvas').getContext('2d')
    ctx.putImageData(image, 0, 0)
});

function load_json(input) {

    // Construct Red, Green and Blue matrix
    let red = calculate_matrix(input['red'])
    let green = calculate_matrix(input['green'])
    let blue = calculate_matrix(input['blue'])


    var output = new Uint8ClampedArray(red.length * red[0].length * 4);


    let c = 0 // counter
    for (let i = 0; i < red.length; i++) {
        for (let j = 0; j < red[0].length; j++) {
            output[c++] = red[i][j]
            output[c++] = green[i][j]
            output[c++] = blue[i][j]
            output[c++] = 255
        }
    }

    return output
}

function calculate_matrix(input) {
    X = input[0]
    D = input[1]
    Y = input[2]

    // A = X * D
    A = new Array(X.length)
    k = X[0].length
    for (let i = 0; i < A.length; i++) {
        temp = new Array(k)
        for (let j = 0; j < k; j++) {
            temp[j] = X[i][j] * D[j]
        }
        A[i] = temp
    }

    // out = A * Y
    out = new Array(X.length)
    k = X[0].length
    for (let i = 0; i < A.length; i++) {
        temp = new Array(Y[0].length)
        for (let j = 0; j < Y[0].length; j++) {
            sum = 0
            for (let f = 0; f < k; f++) {
                sum += A[i][f] * Y[f][j]
            }
            // replace negative values with zero
            temp[j] = sum > 0 ? sum : 0
        }
        out[i] = temp
    }

    return out
}