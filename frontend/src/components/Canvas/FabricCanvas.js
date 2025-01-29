import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import allIcons from "./icons.json";

let _clipboard = null; // Clipboard for copy-paste functionality

const FabricCanvasWithIcons = ({ initialImage, onSave,floorTitle }) => {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [icons, setIcons] = useState([]);
    const [currentIcon, setCurrentIcon] = useState(null);
    const [count, setCount] = useState(null);
    const [step, setStep] = useState("upload"); // Default step is "upload"
    useEffect(() => {
        if (initialImage && canvas) {
            fabric.Image.fromURL(initialImage, (img) => {
                img.scaleToWidth(800);
                img.selectable = false; // Static background
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
            });
        }
    }, [initialImage, canvas]);
    useEffect(() => {
        // Initialize the Fabric.js canvas
        const fabricCanvas = new fabric.Canvas("canvas", {
            width: window.innerWidth < 768 ? window.innerWidth - 40 : 800, // Responsive width
            height: window.innerWidth < 768 ? window.innerWidth * 0.75 : 600, // Keep aspect ratio
            selection: false,
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
    useEffect(() => {
        return () => {
            saveCanvasAsImage(); // Save the map when unmounting the component
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
    if(!canvas) return;
        const dataURL = canvas.toDataURL({
            format: 'png', // You can also use 'jpeg'
            quality: 100,    // Quality for JPEG (0 to 1)
        });

        // Create a temporary link to trigger the download
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'canvas-image.png'; // The name of the saved file
        link.click();
            // Trigger the onSave callback
            if (onSave) {
                onSave(dataURL);
            }

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
        <div className="container">
            {/* Floor Title */}
            <div className="box has-text-centered">
                <h2 className="title">{floorTitle}</h2>
            </div>

            {/* Image Upload Section */}
            {!initialImage && (
                <div className="box">
                    <div className="field">
                        <label className="label">העלה תמונה</label>
                        <div className="file has-name is-boxed is-fullwidth">
                            <label className="file-label">
                                <input className="file-input" type="file" accept="image/*"
                                       onChange={handleImageUpload}/>
                                <span className="file-cta">
                    <span className="file-icon">
                        <i className="fas fa-upload"></i>
                    </span>
                    <span className="file-label">בחר תמונה</span>
                </span>
                            </label>
                        </div>
                    </div>
                </div>

            )}

            {/* Icon Selection Section */}
            <div className="box">
                <h3 className="subtitle has-text-centered">בחר אייקון</h3>
                <div className="columns is-multiline is-mobile is-centered">
                    {icons.map((icon) => (
                        <div className="column is-one-quarter has-text-centered" key={icon.label}>
                            <button className="button is-light is-fullwidth" onClick={() => handleIconClick(icon)}>
                                <figure className="image is-32x32 is-inline-block">
                                    <img src={icon.path} alt={icon.label}/>
                                </figure>
                                <br/>
                                <span className="is-size-7 has-text-weight-bold">{icon.label}</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>


            {/* Debugging Icon Count (Can be removed later) */}
            <div className="notification is-light">{JSON.stringify(count)}</div>

            {/* Canvas Section */}
            <div className="box has-text-centered">
                <canvas
                    id="canvas"
                    ref={canvasRef}

                ></canvas>
            </div>

            {/* Buttons Section */}
            <div className="box">
                <div className="buttons is-centered">
                    <button className="button is-link is-small" onClick={saveCanvasAsImage}>
                        <span className="icon"><i className="fas fa-save"></i></span>
                        <span>שמור תמונה</span>
                    </button>
                    <button className="button is-link is-small" onClick={zoomIn}>
                        <span className="icon"><i className="fas fa-search-plus"></i></span>
                        <span>זום אין</span>
                    </button>
                    <button className="button is-link is-small" onClick={zoomOut}>
                        <span className="icon"><i className="fas fa-search-minus"></i></span>
                        <span>זום אאוט</span>
                    </button>
                    <button className="button is-link is-small" onClick={() => rotateBackgroundImage(90)}>
                        <span className="icon"><i className="fas fa-undo"></i></span>
                        <span>סובב</span>
                    </button>
                    <button className="button is-link is-small" onClick={() => rotateBackgroundImage(-90)}>
                        <span className="icon"><i className="fas fa-redo"></i></span>
                        <span>סובב הפוך</span>
                    </button>
                    <button className="button is-link is-small" onClick={addOrientationMarkers}>
                        <span className="icon"><i className="fas fa-map-marked-alt"></i></span>
                        <span>הוסף אוריינטציה</span>
                    </button>
                </div>
            </div>

        </div>
    );

};

export default FabricCanvasWithIcons;
