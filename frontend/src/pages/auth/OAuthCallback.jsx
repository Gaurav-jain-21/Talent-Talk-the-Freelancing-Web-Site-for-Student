import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { GlassCard } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const { applyOAuth } = useAuth();

  useEffect(() => {
    applyOAuth({
      token: params.get("token"),
      role: params.get("role"),
      userId: params.get("userId"),
      name: params.get("name"),
    });
  }, [applyOAuth, params]);

  return (
    <Page>
      <GlassCard className="p-8 text-center">
        <h1 className="text-3xl font-black gradient-text">Signing you in</h1>
        <p className="mt-2 text-slate-400">Securing your Talent Talk workspace.</p>
      </GlassCard>
    </Page>
  );
}

