import { db } from "@/lib/firebase";
import { getDocs, collection, query, orderBy } from "firebase/firestore";
import { UserCheck, UserX } from "lucide-react";

type AdminUser = {
  id: string;
  email: string;
  displayName?: string;
  role: "admin" | "customer";
  createdAt: Date;
};

async function getUsers(): Promise<AdminUser[]> {
  try {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as AdminUser[];
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
}

export default async function AdminUsers() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl">Manajemen User</h2>
        <p className="mt-2 text-foreground/70">
          Kelola user dan role admin.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-soft bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-espresso/5 text-foreground/70 dark:bg-espresso-light/50">
            <tr>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Display Name</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-foreground/60">
                  Belum ada user.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-espresso/5 dark:hover:bg-espresso-light/5">
                  <td className="px-6 py-4 font-medium">{user.email}</td>
                  <td className="px-6 py-4">{user.displayName}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-rust/10 text-rust dark:bg-rust/20"
                          : "bg-sage/10 text-sage dark:bg-sage/20"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground/60">Aktif</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {user.role === "customer" && (
                        <button
                          className="rounded-lg p-2 text-sage hover:bg-sage hover:text-white dark:hover:bg-sage"
                          aria-label="Jadikan admin"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}
                      {user.role === "admin" && (
                        <button
                          className="rounded-lg p-2 text-rust hover:bg-rust hover:text-white dark:hover:bg-rust"
                          aria-label="Hapus role admin"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
