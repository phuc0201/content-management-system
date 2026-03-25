import { useEffect } from "react";
import { useMatches, type UIMatch } from "react-router-dom";
import { SYSTEM_CONSTANT } from "../constants/system.constant";

type RouteHandle = {
  title: string;
};

export default function RouteTitleSync() {
  const matches = useMatches() as UIMatch<unknown, RouteHandle>[];

  useEffect(() => {
    const matchedRoute = [...matches].reverse().find((match) => match.handle?.title);

    const routeTitle = matchedRoute?.handle?.title;

    document.title = routeTitle ?? SYSTEM_CONSTANT.APP_NAME;
  }, [matches]);

  return null;
}
