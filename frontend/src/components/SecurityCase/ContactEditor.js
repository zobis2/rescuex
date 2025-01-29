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
        <div className="container">
            <div className="box has-text-centered" style={{ background:"transparent",direction: "rtl" }}>
                <h2 className="title">{title}</h2>

                {/* Name input */}
                <div className="field">
                    <label className="label">שם איש הקשר</label>
                    <div className="control">
                        <input
                            type="text"
                            className="input"
                            placeholder="הזן שם"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>

                {/* Phone input */}
                <div className="field">
                    <label className="label">מספר טלפון</label>
                    <div className="control">
                        <input
                            type="tel"
                            className="input"
                            placeholder="הזן מספר טלפון"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                </div>

                {/* Role input */}
                <div className="field">
                    <label className="label">תפקיד</label>
                    <div className="control">
                        <input
                            type="text"
                            className="input"
                            placeholder="הזן תפקיד"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        />
                    </div>
                </div>

                {/* Add contact button */}
                <div className="field">
                    <div className="control">
                        <button
                            className="button is-primary is-fullwidth"
                            onClick={handleAddContact}
                        >
                            הוסף איש קשר
                        </button>
                    </div>
                </div>

                {/* Contact List */}
                <div className="field">
                    <label className="label">רשימת אנשי קשר</label>
                    <ul className="list">
                        {contacts.map((contact, index) => (
                            <li key={index} className="box">
                                <strong>{contact.name}</strong> ({contact.role}): {contact.phone}
                                <button
                                    onClick={() => handleDeleteContact(index)}
                                    className="button is-small is-danger is-pulled-left"
                                >
                                    מחק
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ContactEditor;
