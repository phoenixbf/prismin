# PRISMIN

![Test Image 1](./res/prismin-header.png)

The PRISMIN (Processing and transfeR of Interaction States and Mappings through Image-based eNcoding) framework, allows to encode users' interaction states and mappings into compact and lightweight images, easily *manipulable* and *transferable* between peers in networked contexts. It is designed and developed by B. Fanini (CNR ISPC)

The framework - based on [Node.js](https://nodejs.org/) - provides **Interaction Volumes** (`QVolume class`) as runtime accessories that can be arranged and deployed in virtual 3D scenes to capture or influence user interactions within specific areas. **Interaction Prisms** (`QPrism class`) can be used to *refract* interaction states and *bake* them into images.

![Test Image 1](./res/prismin-banner-h.jpg)

The image-based approach offers GPU-friendly encoding/decoding routines and easy implementations for WebGL shaders to visualize and inspect captured data targeting networked visual/immersive analytics. Furthermore, different atlas layouts allows direct manipulation on GPU and offline processing using common 2D image algorithms to extract, combine or compare user interactions.

## Getting started
First install/update core library modules, from root folder:
```
npm install
```

Then, test out different built-in tools (see specific READMEs):
```
cd tools/<toolname>/
```

## Publications
Here are a few references (links and bibtex) to cite the research project:

B. Fanini, L. Cinque (2020) *Encoding, Exchange and Manipulation of Captured Immersive VR Sessions for Learning Environments: the PRISMIN Framework*. Applied Sciences 2020, 10, 2026. Special Issue "Emerging Artificial Intelligence (AI) Technologies for Learning". https://www.mdpi.com/2076-3417/10/6/2026
```
@article{fanini2020prismin,
  title={Encoding, Exchange and Manipulation of Captured Immersive VR Sessions for Learning Environments: the PRISMIN Framework},
  author={Fanini, Bruno and Cinque, Luigi},
  journal={Applied Sciences},
  volume={10},
  number={6},
  pages={2026},
  year={2020},
  publisher={Multidisciplinary Digital Publishing Institute}
}
```

B. Fanini, L. Cinque (2019). *Encoding immersive sessions for online, interactive VR analytics*. Virtual Reality (Springer), 1-16. https://link.springer.com/article/10.1007%2Fs10055-019-00405-w
```
@article{fanini2019vire,
    title={Encoding immersive sessions for online, interactive VR analytics},
    journal={Virtual Reality},
    author={Fanini, Bruno and Cinque, Luigi},
    doi={10.1007/s10055-019-00405-w},
    url={http://doi.org/10.1007/s10055-019-00405-w},
    issn={1359-4338},
    year={2019}
}
```

B. Fanini, L. Cinque (2019, July). *An Image-Based Encoding to Record and Track Immersive VR Sessions*. In International Conference on Computational Science and Its Applications (pp. 299-310). Springer, Cham.
https://link.springer.com/chapter/10.1007/978-3-030-24296-1_25
```
@inproceedings{fanini2019image,
    title={An Image-Based Encoding to Record and Track Immersive VR Sessions},
    author={Fanini, Bruno and Cinque, Luigi},
    booktitle={International Conference on Computational Science and Its Applications},
    pages={299--310},
    year={2019},
    organization={Springer}
}
```
