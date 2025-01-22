import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import allIcons from "./icons.json";

let _clipboard = null; // Clipboard for copy-paste functionality

const FabricCanvasWithIcons = () => {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [icons, setIcons] = useState([]);
    const [currentIcon, setCurrentIcon] = useState(null);

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

    const handleIconClick = (icon) => {
        // Load the selected SVG icon onto the canvas
        fabric.loadSVGFromString(icon.svg, (objects, options) => {
            const svgIcon = fabric.util.groupSVGElements(objects, options);
            svgIcon.scale(0.2); // Adjust scale
            svgIcon.set({ left: 100, top: 100, selectable: true });
            canvas.add(svgIcon);
            canvas.setActiveObject(svgIcon);
            canvas.renderAll();
            setCurrentIcon(svgIcon); // Set current icon for copying
        });
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



    return (
        <div>
            {/* Image upload */}
            <div style={{ marginBottom: "10px" }}>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
            </div>

            {/* Icon selection */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                {icons.map((icon) => (
                    <button key={icon.name} onClick={() => handleIconClick(icon)}>
                        <img
                            src={`data:image/svg+xml;utf8,${encodeURIComponent(icon.svg)}`}
                            alt={icon.label}
                            style={{ width: 30, height: 30 }}
                        />
                        <br />
                        {icon.label}
                    </button>
                ))}
            </div>

            {/* Canvas */}
            <canvas id="canvas" ref={canvasRef} style={{ border: "1px solid black" }}></canvas>
            <button className="button is-link" onClick={saveCanvasAsImage}>שמור תמונה</button>
            {/* Copy-Paste Buttons */}

        </div>
    );
};

export default FabricCanvasWithIcons;
