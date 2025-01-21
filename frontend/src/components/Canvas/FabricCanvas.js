import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import allIcons from "./icons.json"; // Assuming your icons JSON file is named `icons.json`

const FabricCanvasWithIcons = () => {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [icons, setIcons] = useState([]);
    const [currentIcon, setCurrentIcon] = useState(null);

    // Initialize Fabric.js canvas and load icons
    useEffect(() => {
        const fabricCanvas = new fabric.Canvas("canvas", {
            width: 800,
            height: 600,
            backgroundColor: "#f0f0f0",
        });
        setCanvas(fabricCanvas);

        // Load icons from JSON
        setIcons(allIcons);
    }, []);

    // Handle image upload and set it as canvas background
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                fabric.Image.fromURL(event.target.result, (img) => {
                    img.scaleToWidth(800); // Fit image to canvas
                    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
                });
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle icon selection
    const handleIconClick = (icon) => {
        setCurrentIcon(icon); // Set the selected icon
    };

    // Handle canvas click to place the selected icon
    const handleCanvasClick = (event) => {
        if (currentIcon) {
            fabric.loadSVGFromString(currentIcon.svg, (objects, options) => {
                const svgIcon = fabric.util.groupSVGElements(objects, options);
                svgIcon.scale(0.1); // Adjust scale to fit canvas
                const pointer = canvas.getPointer(event.e); // Get mouse pointer position
                svgIcon.set({ left: pointer.x, top: pointer.y });
                canvas.add(svgIcon);
                canvas.renderAll();
            });
        }
    };

    // Add event listener for canvas clicks
    useEffect(() => {
        if (canvas) {
            canvas.on("mouse:down", handleCanvasClick);
        }
        return () => {
            if (canvas) {
                canvas.off("mouse:down", handleCanvasClick);
            }
        };
    }, [canvas, currentIcon]);

    return (
        <div>
            {/* Image upload */}
            <div style={{ marginBottom: "10px" }}>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
            </div>

            {/* Icons */}
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
        </div>
    );
};

export default FabricCanvasWithIcons;
