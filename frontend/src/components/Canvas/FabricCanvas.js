import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import allIcons from "./icons.json";

let _clipboard = null; // Clipboard for copy-paste functionality

const FabricCanvasWithIcons = () => {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [icons, setIcons] = useState([]);
    const [currentIcon, setCurrentIcon] = useState(null);
    const [count, setCount] = useState(null);

    useEffect(() => {
        // Initialize the Fabric.js canvas
        const fabricCanvas = new fabric.Canvas("canvas", {
            width: 800,
            height: 600,
            selection: false, // Disable multi-selection
        });
        setCanvas(fabricCanvas);

        // Load icons from JSON
        setIcons(allIcons);
        let firstCount={}
        allIcons.forEach(icon=>{
            firstCount[icon.name] =0;
        })
        debugger;
        setCount(firstCount);

        // Clean up on unmount
        return () => {
            fabricCanvas.dispose();
        };
    }, []);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                fabric.Image.fromURL(event.target.result, (img) => {
                    img.scaleToWidth(800);
                    img.selectable = false; // Make the image static
                    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleIconClick = async (icon) => {
        try {
            debugger;
           let currentCount=JSON.parse(JSON.stringify(count));
           currentCount[icon.name]++;
            setCount(currentCount);
            fabric.Image.fromURL(icon.path, (img) => {
                img.scale(0.05); // Adjust the scale if needed
                img.set({
                    left: 100,
                    top: 100,
                    selectable: true,
                });
                canvas.add(img);
                canvas.renderAll();
            });
            // const response = await fetch(icon.path);
            // const contentType = response.headers.get('Content-Type');
            // debugger;
            // // if (!contentType.includes('image/svg+xml')) {
            // //     throw new Error('Invalid SVG file or incorrect Content-Type.');
            // // }
            //
            // const svgContent = await response.text();
            // fabric.loadSVGFromString(svgContent, (objects, options) => {
            //     const svgIcon = fabric.util.groupSVGElements(objects, options);
            //     svgIcon.scale(0.2); // Adjust scale
            //     svgIcon.set({ left: 100, top: 100, selectable: true });
            //     canvas.add(svgIcon);
            //     canvas.setActiveObject(svgIcon);
            //     canvas.renderAll();
            // });
        } catch (error) {
            console.error('Error loading SVG:', error);
            alert('Failed to load SVG. Please check the file path or content.');
        }
    };
    const saveCanvasAsImage = () => {
        const dataURL = canvas.toDataURL({
            format: 'png', // You can also use 'jpeg'
            quality: 100,    // Quality for JPEG (0 to 1)
        });

        // Create a temporary link to trigger the download
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'canvas-image.png'; // The name of the saved file
        link.click();
    };


    const zoomIn = () => {
        const zoom = canvas.getZoom();
        canvas.setZoom(zoom * 1.1); // Increase zoom by 10%
        canvas.requestRenderAll();
    };

    const zoomOut = () => {
        const zoom = canvas.getZoom();
        canvas.setZoom(zoom / 1.1); // Decrease zoom by 10%
        canvas.requestRenderAll();
    };
    const rotateBackgroundImage = (angle) => {
        if (!canvas) return;

        const backgroundImage = canvas.backgroundImage;
        if (backgroundImage) {
            // Adjust the angle of the background image
            const currentAngle = backgroundImage.angle || 0;
            backgroundImage.angle = currentAngle + angle;

            // Center the background image on the canvas
            backgroundImage.originX = 'center';
            backgroundImage.originY = 'center';
            backgroundImage.left = canvas.getWidth() / 2;
            backgroundImage.top = canvas.getHeight() / 2;

            backgroundImage.setCoords();
            canvas.renderAll();
        } else {
            console.error('No background image found on the canvas.');
        }
    };
    return (
        <div>
            {/* Image upload */}
            <div style={{marginBottom: "10px"}}>
                <input type="file" accept="image/*" onChange={handleImageUpload}/>
            </div>

            {/* Icon selection */}
            <div style={{display: "flex", gap: "10px", marginBottom: "10px"}}>
                {icons.map((icon) => (
                    <button key={icon.name} onClick={() => handleIconClick(icon)}>
                        <img
                            // src={`data:image/svg+xml;utf8,${encodeURIComponent(icon.path)}`
                            src={icon.path}

                            alt={icon.label}
                            style={{width: 30, height: 30}}
                        />
                        <br/>
                        {icon.label}
                    </button>
                ))}
            </div>
            <div>
                {JSON.stringify(count)}
            </div>
            {/* Canvas */}
            <canvas id="canvas" ref={canvasRef} style={{border: "1px solid black"}}></canvas>
            <button className="button is-link" onClick={saveCanvasAsImage}>שמור תמונה</button>
            <button className="button is-link" onClick={zoomIn}>זום אין</button>
            <button className="button is-link" onClick={zoomOut}>זום אאוט</button>
            <button className="button is-link" onClick={() => rotateBackgroundImage(90)}>
                סובב
            </button>
            <button className="button is-link" onClick={() => rotateBackgroundImage(-90)}>
                 סובב הפוך
            </button>
        </div>
    );
};

export default FabricCanvasWithIcons;
