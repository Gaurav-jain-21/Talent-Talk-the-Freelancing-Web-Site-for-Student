import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth";
import { GlassCard } from "../../components/ui/Primitives";
import { Page } from "../../components/ui/Motion";
import { errorMessage } from "../../utils/format";

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { applyOAuth } = useAuth();

  useEffect(() => {
    const token = params.get("token");
    const error = params.get("error");

    if (error || !token) {
      toast.error(params.get("message") || "Google sign-in failed");
      navigate("/login", { replace: true });
      return;
    }

    applyOAuth({
      token,
      role: params.get("role"),
      userId: params.get("userId"),
      name: params.get("name"),
      email: params.get("email"),
      imageUrl: params.get("imageUrl"),
    }).catch((authError) => {
      toast.error(errorMessage(authError));
      navigate("/login", { replace: true });
    });
  }, [applyOAuth, navigate, params]);

  return (
    <Page>
      <GlassCard className="p-8 text-center">
        <h1 className="text-3xl font-black gradient-text">Signing you in</h1>
        <p className="mt-2 text-slate-400">Securing your Talent Talk workspace.</p>
      </GlassCard>
    </Page>
  );
}
