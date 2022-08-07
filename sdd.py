import numpy as np

from math import trunc
from glob import glob
from PIL import Image
from tqdm import tqdm
import json

def changeColorDepth(image, colorCount):
    
    if image.mode == 'L':
        raito = 256 / colorCount
        change = lambda value: trunc(value/raito)*raito
        return image.point(change)
    
    if image.mode == 'RGB' or image.mode == 'RGBA':
        raito = 256 / colorCount
        change = lambda value: trunc(value/raito)*raito
        return Image.eval(image, change)
    
    raise ValueError('Cannot convert {}'.format(image.mode))

def maximize_F(s):
    perm = np.argsort(np.abs(s))[::-1]
   
    n = len(s)
    best_val = 0
    best_v = 0
    for i in range(n):
        v = np.zeros(n)
        for j in range(0, i+1):
            v[perm[j]] = np.sign(s[perm[j]])
        val = (v @ s)**2/(np.linalg.norm(v)**2)
        if val > best_val:
            best_val = val
            best_v = v
    return best_v

def SDD(A, k, name=''):
    #store values
    d_s = []
    x_s = []
    y_s = []

    iteration_bar = tqdm(range(k), desc=name + ' SDD')

    for _ in iteration_bar:
        # pick some y to start
        y = np.random.randint(low=-1, high=2, size=A.shape[1])
        y[0] = 1

        # maximize x^t s / ||x||^2 to find x
        s = (A @ y)/(np.linalg.norm(y, 2)**2)
        x = maximize_F(s)

        # repeat until max is not changing much or after fixed number:
        # I will always do 5 iterations since nothing seems to change after that
        for _ in range(5):
            #s = (x @ A)/np.linalg.norm(y, 2) #K: small typo here (-0.5 pt) 
            s = (x @ A)/np.linalg.norm(x, 2) #K: fixed it
            y = maximize_F(s)

            s = (A @ y)/np.linalg.norm(y, 2)
            x = maximize_F(s)

        d = round((x @ A @ y)/(np.linalg.norm(x)**2 * np.linalg.norm(y)**2), 0)
      
        iteration_bar.set_description(name + ' SDD. Current d: %d' % d)

        if d > 0:
            A = A - d * x[:,None] @ y[None, :]

            d_s.append(int(d))
            x_s.append(x)
            y_s.append(y)

        else:
            break
    
    X = np.array(x_s).T
    Y = np.array(y_s)
    
    return X, d_s, Y

for picture in glob('examples/in/*'):

    name = picture[picture.rindex('\\') + 1: -4]

    print('Starting', name)
    img = Image.open(picture)
    img.load()
    changeColorDepth(image=img, colorCount=24)
    img = np.asarray(img, dtype=np.int32)

    red = img[:, :, 0]
    green = img[:, :, 1]
    blue = img[:, :, 2]

    k = 25
    
    X_r, D_r, Y_r = SDD(red, k, 'Red')
    X_g, D_g, Y_g = SDD(green, k, 'Green')
    X_b, D_b, Y_b = SDD(blue, k, 'Blue')

    # save to json
    data = {}

    data['red'] = [[list(X_r[i]) for i in range(len(X_r))], list(D_r), [list(Y_r[j]) for j in range(len(Y_r))]]
    data['green'] = [[list(X_g[i]) for i in range(len(X_g))], list(D_g), [list(Y_g[j]) for j in range(len(Y_g))]]
    data['blue'] = [[list(X_b[i]) for i in range(len(X_b))], list(D_b), [list(Y_b[j]) for j in range(len(Y_b))]]

    with open('examples/out/' + name + '.json', 'w') as f:
        json.dump(data, f)



    break