<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

use Closure;

final class Router
{
    /** @var array<string, array<string, Closure(Request): Response>> */
    private array $routes = [];
    /**
     * @var list<array{
     *   template: string,
     *   pattern: string,
     *   parameters: list<string>,
     *   methods: array<string, Closure(Request): Response>
     * }>
     */
    private array $parameterizedRoutes = [];

    /** @param Closure(Request): Response $handler */
    public function add(string $method, string $path, Closure $handler): void
    {
        $method = strtoupper($method);
        if (str_contains($path, '{')) {
            $this->addParameterized($method, $path, $handler);
            return;
        }
        if (isset($this->routes[$path][$method])) {
            throw new \LogicException(sprintf('Duplicate route: %s %s', $method, $path));
        }
        $this->routes[$path][$method] = $handler;
    }

    /** @return list<string> */
    public function allowedMethods(string $path): array
    {
        $match = $this->match($path);
        $methods = array_keys($match['methods'] ?? []);
        sort($methods);
        return $methods;
    }

    public function dispatch(Request $request): Response
    {
        $match = $this->match($request->path);
        if ($match === null) {
            throw new ApiException(404, 'not_found', 'Reittiä ei löytynyt.');
        }

        $methods = $match['methods'];

        $handler = $methods[$request->method] ?? null;
        if ($handler === null) {
            $allowed = array_keys($methods);
            sort($allowed);
            throw new ApiException(
                405,
                'method_not_allowed',
                'HTTP-metodi ei ole sallittu tälle reitille.',
                headers: ['Allow' => implode(', ', $allowed)],
            );
        }

        return $handler($request->withPathParameters($match['path_parameters']));
    }

    /** @param Closure(Request): Response $handler */
    private function addParameterized(string $method, string $path, Closure $handler): void
    {
        foreach ($this->parameterizedRoutes as &$route) {
            if ($route['template'] !== $path) {
                continue;
            }
            if (isset($route['methods'][$method])) {
                throw new \LogicException(sprintf('Duplicate route: %s %s', $method, $path));
            }
            $route['methods'][$method] = $handler;
            return;
        }
        unset($route);

        $parameters = [];
        $patternSegments = [];
        foreach (explode('/', trim($path, '/')) as $segment) {
            if (preg_match('/^\{([A-Za-z][A-Za-z0-9_]*)\}$/D', $segment, $matches) === 1) {
                $name = $matches[1];
                if (in_array($name, $parameters, true)) {
                    throw new \LogicException('Route parameter names must be unique.');
                }
                $parameters[] = $name;
                $patternSegments[] = '(?P<' . $name . '>[^/]+)';
                continue;
            }
            if (str_contains($segment, '{') || str_contains($segment, '}')) {
                throw new \LogicException('Route parameters must occupy a complete path segment.');
            }
            $patternSegments[] = preg_quote($segment, '~');
        }
        if ($parameters === []) {
            throw new \LogicException('Parameterized route does not contain a parameter.');
        }

        $this->parameterizedRoutes[] = [
            'template' => $path,
            'pattern' => '~^/' . implode('/', $patternSegments) . '$~D',
            'parameters' => $parameters,
            'methods' => [$method => $handler],
        ];
    }

    /**
     * @return array{
     *   methods: array<string, Closure(Request): Response>,
     *   path_parameters: array<string, string>
     * }|null
     */
    private function match(string $path): ?array
    {
        if (isset($this->routes[$path])) {
            return ['methods' => $this->routes[$path], 'path_parameters' => []];
        }

        foreach ($this->parameterizedRoutes as $route) {
            if (preg_match($route['pattern'], $path, $matches) !== 1) {
                continue;
            }
            $pathParameters = [];
            foreach ($route['parameters'] as $name) {
                $pathParameters[$name] = (string) ($matches[$name] ?? '');
            }
            return ['methods' => $route['methods'], 'path_parameters' => $pathParameters];
        }
        return null;
    }
}
