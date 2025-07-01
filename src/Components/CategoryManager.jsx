import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

function CategoryManager({ userId }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "users", userId, "categories"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [userId]);

  const addCategory = async () => {
    if (!newCategory.trim()) return;

    await addDoc(collection(db, "users", userId, "categories"), {
      name: newCategory.trim(),
      createdAt: new Date(),
    });
    setNewCategory("");
  };

  const deleteCategory = async (id) => {
    const confirm = window.confirm("Delete this category?");
    if (!confirm) return;

    await deleteDoc(doc(db, "users", userId, "categories", id));
  };

  const startEditing = (cat) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const saveEdit = async () => {
    if (!editingName.trim()) return;

    await updateDoc(
      doc(db, "users", userId, "categories", editingId),
      { name: editingName.trim() }
    );
    setEditingId(null);
    setEditingName("");
  };

  return (
    <div className="bg-bg-200 p-4 rounded-xl text-text-100 max-w-md mx-auto space-y-4 mt-10 shadow-md">
      <h2 className="text-2xl font-bold text-primary-200 text-center">
        Category Manager
      </h2>

      <div className="flex gap-2">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name"
          className="flex-1 px-4 py-2 bg-bg-300 rounded text-text-100 placeholder-text-200 focus:outline-none"
        />
        <button
          onClick={addCategory}
          className="bg-accent-100 hover:bg-accent-200 px-4 py-2 rounded text-text-100 font-medium"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="bg-bg-300 p-3 rounded flex justify-between items-center"
          >
            {editingId === cat.id ? (
              <>
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="bg-bg-200 px-2 py-1 rounded text-text-100 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="text-green-400 hover:underline"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-text-200 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <span>{cat.name}</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => startEditing(cat)}
                    className="text-yellow-400 hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="text-red-400 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoryManager;
