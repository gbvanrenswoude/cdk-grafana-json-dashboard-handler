{
  pkgs,
  lib,
  config,
  inputs,
  ...
}: {
  packages = [pkgs.nodejs_23 pkgs.biome];

  languages = {
    typescript.enable = true;
  };

  pre-commit = {
    hooks = {
      biome = {
        package = pkgs.biome;
        enable = true;
        entry = "${pkgs.biome}/bin/biome check --write --no-errors-on-unmatched --diagnostic-level=error --colors=off --verbose";
      };
      prettier = {
        enable = true;
        files = "\\.(ya?ml)$";
      };
      alejandra.enable = true;
      statix = {
        enable = true;
        pass_filenames = true;
        # https://github.com/oppiliappan/statix/issues/69
        entry = "bash -c 'echo \"$@\" | xargs -n1 ${pkgs.statix}/bin/statix check'";
      };
      typos = {
        enable = true;
        entry = "${pkgs.typos}/bin/typos --force-exclude --exclude .git/*";
      };
    };
  };
}
