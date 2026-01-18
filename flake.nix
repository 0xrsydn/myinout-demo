{
  description = "MyInOut AI development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            bun
            nodejs_22  # For Vite and other Node.js tooling
            uv         # Python package/runtime manager (manages its own Python)
          ];

          shellHook = ''
            echo "MyInOut AI development environment loaded"
            echo "  - Bun: $(bun --version)"
            echo "  - Node: $(node --version)"
            echo "  - uv: $(uv --version)"
          '';
        };
      });
}
