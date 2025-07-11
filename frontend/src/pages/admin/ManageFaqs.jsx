import React, { useState, useEffect } from 'react';
import API from '../../api/index';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPenToSquare, } from '@fortawesome/free-solid-svg-icons';

const ManageFaqs = () => {
    // State for the list of FAQs
    const [faqs, setFaqs] = useState([]);
    const [loadingList, setLoadingList] = useState(true);

    // State for the "Add New" form
    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    // State for inline editing
    const [editingFaqId, setEditingFaqId] = useState(null);
    const [editingFaq, setEditingFaq] = useState({ question: '', answer: '' });

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            setLoadingList(true);
            const { data } = await API.get('/api/faqs');
            setFaqs(data);
        } catch (error) {
            console.error("Failed to fetch FAQs:", error);
        } finally {
            setLoadingList(false);
        }
    };

    const handleNewFaqChange = (e) => {
        setNewFaq({ ...newFaq, [e.target.name]: e.target.value });
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        setCreateError('');
        try {
            await API.post('/api/faqs', newFaq);
            setNewFaq({ question: '', answer: '' }); // Reset form
            fetchFaqs(); // Refresh the list
        } catch (err) {
            setCreateError(err.response?.data?.message || 'Failed to add FAQ');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this FAQ?')) {
            try {
                await API.delete(`/api/faqs/${id}`);
                fetchFaqs();
            } catch (error) {
                console.log(error)
                alert("Could not delete FAQ.");
            }
        }
    };

    const handleUpdate = async (id) => {
        try {
            await API.put(`/api/faqs/${id}`, editingFaq);
            setEditingFaqId(null);
            setEditingFaq({ question: '', answer: '' });
            fetchFaqs();
        } catch (error) {
            console.log(error)
            alert("Could not update FAQ.");
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage FAQs</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- Add New Form --- */}
                <div className="lg:col-span-1">
                    <form onSubmit={handleCreateSubmit} className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4 text-gray-700">Add New FAQ</h3>
                        {createError && <div className="text-red-500 bg-red-100 p-2 rounded mb-3 text-sm">{createError}</div>}
                        <div className="space-y-4">
                            <Input label="Question" name="question" value={newFaq.question} onChange={handleNewFaqChange} required />
                            <div>
                                <label htmlFor="answer" className="block text-sm font-medium text-gray-700">Answer</label>
                                <textarea name="answer" id="answer" value={newFaq.answer} onChange={handleNewFaqChange} rows="4" required className="mt-1 shadow-sm focus:ring-accent focus:border-accent block w-full sm:text-sm border-gray-300 rounded-md"></textarea>
                            </div>
                            <Button type="submit" disabled={isCreating} fullWidth>
                                {isCreating ? 'Adding...' : 'Add FAQ'}
                            </Button>
                        </div>
                    </form>
                </div>
                {/* --- List of Existing FAQs --- */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Existing FAQs</h3>
                    {loadingList ? <Loader /> : (
                        <div className="space-y-4">
                            {faqs.map((faq) => (
                                <div key={faq._id} className="border-b pb-3">
                                    {editingFaqId === faq._id ? (
                                        // Editing view
                                        <div className="space-y-2">
                                            <Input label="Question" value={editingFaq.question} onChange={e => setEditingFaq({ ...editingFaq, question: e.target.value })} />
                                            <textarea value={editingFaq.answer} onChange={e => setEditingFaq({ ...editingFaq, answer: e.target.value })} rows="3" className="shadow-sm focus:ring-accent focus:border-accent block w-full sm:text-sm border-gray-300 rounded-md"></textarea>
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleUpdate(faq._id)} variant="primary" size="sm">Save</Button>
                                                <Button onClick={() => setEditingFaqId(null)} variant="secondary" size="sm">Cancel</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Display view
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-gray-800">{faq.question}</p>
                                                <p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
                                            </div>
                                            <div className="flex-shrink-0 flex items-center gap-3 ml-4">
                                                <button onClick={() => { setEditingFaqId(faq._id); setEditingFaq({ question: faq.question, answer: faq.answer }) }} className="text-blue-500 hover:text-blue-700 p-1"><FontAwesomeIcon icon={faPenToSquare} /></button>
                                                <button onClick={() => handleDelete(faq._id)} className="text-red-500 hover:text-red-700 p-1"><FontAwesomeIcon icon={faTrash} /></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default ManageFaqs;