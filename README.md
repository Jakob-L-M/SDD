# SDD Image Processing

I was inspired by a recent lecture I took at Uni. In said lecture we discussed different matrix decompositions. This repo will be used to visualize semi-discread matrix decompositions (SDD) on images and provide a visual idea of the compression as well as concreate compression rates.

Look the result using some example pictures on my [website](https://jakob.)

## Theory of SDD

A semi-discrete matrix decomposition is a sum of rank one matrices. Every summand is constructed by

<img src="https://latex.codecogs.com/gif.latex?A_i = d_i \cdot x_i \cdot y_i^T; d_i > 0; x_i,y_i \in \{-1, 0, 1\}^n" />

We can represent any matrix A exatly as the sum
<img src="https://latex.codecogs.com/gif.latex?A = A_1 + A_2 + \dots + A_k" /> 
when choosing k large enough.

Since x and y can only take three differnt values we can store their values very efficently, needing only 2 Bits per entry. Additionaly x and y are expected to be (very) sparse for bigger k. This could be used with hamming codes to further compress images lossless.

## Calculating compression rates

My examples are based on 512 * 512 rgb pictures. That means in a raw format we have 512*512 Bytes ~ 786kb

The compression rates will always be in relation to k. In one byte we are able to store 4 entries of x (or y). So we need 2 * 512/4 = 128 Bytes to store x and y and one additional byte for d. Since we have three layers (red, green, blue) we will need 129 * 3 = 387 Bytes per layer. So in total the SDD approximation of the picture will take 387*k Bytes. To match the raw format we could calculate around 2.000 layers.

My visualization will take a maximum of 250 layers into account.

The output images will be `.jsdd` files. A custom data type which is than interpreted by the javaScript code.

## Visualizing results

Pick a picture on the website and use the slider to select the number of layers. The canvas shows the state of the SDD approximation based of the selected value of k. Additionally the `.jsdd` file size is displayed.

## Using your own pictures

Place your pictures in `examples/in` and run `python sdd.py --FILENAME`. If you want the json output as well, add `--json`

## Resources

%TODO add algo references, literature, thank you words, contact
