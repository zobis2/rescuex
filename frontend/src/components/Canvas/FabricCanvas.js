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
            firstCount[icon.label] =0;
        })
        debugger;
        setCount(firstCount);

        // Clean up on unmount
        return () => {
            fabricCanvas.dispose();
        };
    }, []);
    const addOrientationMarkers = () => {
        if (!canvas) return;

        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();

        // Define positions for each orientation
        const positions = {
            צפון: { left: canvasWidth / 2, top: 20 },
            דרום: { left: canvasWidth / 2, top: canvasHeight - 40 },
            מערב: { left: canvasWidth - 40, top: canvasHeight / 2 },
            מזרח: { left: 20, top: canvasHeight / 2 },
        };

        Object.keys(positions).forEach((orientation) => {
            const pos = positions[orientation];
            const text = new fabric.Text(orientation.toUpperCase(), {
                ...pos,
                fontSize: 16,
                fill: "red",
                originX: "center",
                originY: "center",
                selectable: false,
            });
            canvas.add(text);
        });

        canvas.renderAll();
    };

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
           currentCount[icon.label]++;
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
        <div className='container'>
            {/* Image upload */}
            <div className="field">
                <label className="label">Upload Image</label>
                <div className="control">
                    <input className="input" type="file" accept="image/*" onChange={handleImageUpload}/>
                </div>
            </div>

            {/* Icon selection */}
            <div className="columns is-multiline is-mobile">
                {icons.map((icon) => (
                    <div className="column is-one-quarter" key={icon.name}>
                        <button className="button is-light" onClick={() => handleIconClick(icon)}>
                            <img
                                src={icon.path}
                                alt={icon.label}
                                style={{width: "24px", height: "24px"}}
                            />
                            <br/>
                            {icon.label}
                        </button>
                    </div>
                ))}
            </div>
            <div>
                {JSON.stringify(count)}
            </div>
            {/* Canvas */}
            <div className="box">

            <canvas id="canvas" ref={canvasRef} style={{
                border: "1px solid black",
                width: "100%", // תופס את כל רוחב הקונטיינר
                maxWidth: "800px", // מגביל לגודל מקסימלי
                height: "400px", // גובה סטנדרטי
            }}></canvas>
            </div>
            <div className="buttons">

            <button className="button is-link is-small" onClick={saveCanvasAsImage}>שמור תמונה</button>
            <button className="button is-link is-small" onClick={zoomIn}>זום אין</button>
            <button className="button is-link is-small" onClick={zoomOut}>זום אאוט</button>
            <button className="button is-link is-small" onClick={() => rotateBackgroundImage(90)}>
                סובב
            </button>
            <button className="button is-link is-small" onClick={() => rotateBackgroundImage(-90)}>
                סובב הפוך
            </button>
            <button className="button is-link is-small" onClick={() => addOrientationMarkers()}>
                הוספת אורינטציה
            </button>
            </div>
        </div>
    );
};

export default FabricCanvasWithIcons;
