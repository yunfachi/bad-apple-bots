{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/master";

  outputs = {nixpkgs, ...}: let
    pkgs = import nixpkgs {
      system = "x86_64-linux";
      config.allowUnfree = true;
    };
  in {
    devShells."x86_64-linux" = {
      default = pkgs.mkShell {
        buildInputs = [
          pkgs.nodejs
          pkgs.python311
          pkgs.python311Packages.numpy
          pkgs.python311Packages.opencv4
        ];
      };
    };
  };
}
