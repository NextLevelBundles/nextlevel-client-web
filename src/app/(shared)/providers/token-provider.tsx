import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function TokenProvider() {
  const session = useSession();

  useEffect(() => {
    const token = session?.data?.id_token;
  });

  return null;
}
