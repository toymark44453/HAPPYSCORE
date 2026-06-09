"use client";

import { useEffect, useState } from "react";
import { SALESPEOPLE, getCurrentUser, setCurrentUser } from "@/lib/users";
import type { Salesperson } from "@/types/salesperson";

interface Props {
  onChange: (user: Salesperson) => void;
}

export function CurrentUserSelector({ onChange }: Props) {
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    const current = getCurrentUser();
    setSelected(current.id);
  }, []);

  function handleChange(id: string) {
    setCurrentUser(id);
    setSelected(id);
    const user = SALESPEOPLE.find((u) => u.id === id);
    if (user) onChange(user);
  }

  return (
    <div className="current-user-selector">
      <label htmlFor="current-user">มุมมองของ:</label>
      <select
        id="current-user"
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
      >
        {SALESPEOPLE.map((u) => (
          <option key={u.id} value={u.id}>
            {u.role === "owner" ? `👑 ${u.name}` : u.name}
          </option>
        ))}
      </select>
    </div>
  );
}
