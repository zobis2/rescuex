import React, { useState, useEffect } from "react";

const ContactEditor = ({ title, initialData = [], onSave }) => {
    const [contacts, setContacts] = useState(initialData);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("");

    useEffect(() => {
        setContacts(initialData); // Update contacts when initialData changes
    }, [initialData]);

    const handleAddContact = () => {
        if (!name || !phone || !role) return;
        const newContact = { name, phone, role };
        const updatedContacts = [...contacts, newContact];
        setContacts(updatedContacts);
        onSave(updatedContacts); // Pass data to parent
        setName("");
        setPhone("");
        setRole("");
    };

    const handleDeleteContact = (index) => {
        const updatedContacts = contacts.filter((_, i) => i !== index);
        setContacts(updatedContacts);
        onSave(updatedContacts); // Pass data to parent
    };

    return (
        <div className="contact-editor" style={{ direction: "rtl" }}>
            <h2>{title}</h2>
            <div>
                <input
                    type="text"
                    placeholder="שם איש הקשר"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                />
                <input
                    type="text"
                    placeholder="מספר טלפון"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input"
                />
                <input
                    type="text"
                    placeholder="תפקיד"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="input"
                />
                <button onClick={handleAddContact} className="button is-primary">
                    הוסף
                </button>
            </div>
            <ul>
                {contacts.map((contact, index) => (
                    <li key={index}>
                        <strong>{contact.name}</strong> ({contact.role}): {contact.phone}{" "}
                        <button
                            onClick={() => handleDeleteContact(index)}
                            className="button is-small is-danger"
                        >
                            מחק
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ContactEditor;
