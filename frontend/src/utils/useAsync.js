/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { errorMessage } from "./format";

export function useAsync(loader, dependencies = [], options = {}) {
  const [data, setData] = useState(options.initialData ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loaderRef = useRef(loader);
  const optionsRef = useRef(options);

  useEffect(() => {
    loaderRef.current = loader;
    optionsRef.current = options;
  });

  const run = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await loaderRef.current();
      setData(result);
      return result;
    } catch (err) {
      const message = errorMessage(err);
      setError(message);
      if (optionsRef.current.toast !== false) toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    run();
  }, dependencies);

  return { data, loading, error, refresh: run, setData };
}
