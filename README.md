Installer raspbian lite (sans desktop)
Installer raspberrypi-ui-mods (interface graphique)

Supprimer utilisateur pi
Créer utilisateur gekko
    password: Gekko2017@

Définir mot de passe pour root
    password: Gekko2017@


Lancer le playbook ansible:

Télécharger les certificats IOT de l'objet et le mettre dans le dossier 'src/config'

Définir l'ip de la raspberry dans le fichier 'ansible/hosts'

```
    cd ansible
    ansible-playbook -i hosts gyrophare.yml --ask-pass --ask-become-pass
```


Pour tester le code en local définir la variable d'environnement:

```
    export IS_RPI=false
```


Mettre le delais dans le shadow
Configurer les boutons