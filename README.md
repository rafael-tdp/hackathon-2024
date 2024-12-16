# Hackathon 2024 - Gestion d'établissement scolaire

Bienvenue dans notre projet réalisé dans le cadre du Hackathon 2024. Cette application permet de gérer efficacement un établissement scolaire grâce à ses multiples fonctionnalités.

---

## 📌 Fonctionnalités et auteurs

1. **Replanification des cours annulés par drag et drop**  
   - Replanification des cours annulés via drag et drop (créé par *Rafael* et *Saidou*).  

2. **Génération automatique du planning via IA**  
   - Génération automatique du planning des cours en fonction des disponibilités des intervenants, des semaines de cours, des matières etc. (créé par *Rafael* et *Makan*).

3. **Notifications**  
   - Notifications envoyées aux professeurs lorsque les cours sont repositionnés (créé par *Asma*).  

4. **Filtre sur les cours**  
   - Filtre sur les cours par classe, intervenant, salle, status. (créé par *Rafael* et *Saidou*).

5. **Indisponibilités**

    - Admin : peut créer une indisponibilité pour n'importe quel intervenant et un Intervenant : peut créer et gérer ses propres indisponibilités. (créé par *Asma*).

6. **Gestion des rôles**  
   - Rôles disponibles :  
     - **Admin** : accès complet à toutes les fonctionnalités, y compris la gestion des utilisateurs, intervenants, élèves, cours, classes, alertes, indisponibilités et planning.  
     - **Intervenant** : accès limité à la liste des étudiants, notifications reçues, et gestion de ses propres indisponibilités.  
     - **Élève** : accès uniquement à ses cours et au planning.  
   - Système d'envoi de mot de passe par email lors de la création d'un utilisateur (créé par *Asma*).  

7. **Système de pagination**  
   - Implémentation de la pagination sur tous les tableaux de bord (créé par *Asma*).  

8. **Dashboard avec statistiques**  
   - Vue globale des métriques essentielles de l'établissement (créé par *Sharan* et *Asma*).  

0. **Les intervenants peuvent définir leurs préférences pour les horaires, les matières ou les salles.** Ces préférences sont prises en compte lors de la création du planning pour optimiser l'affectation des cours en fonction des disponibilités et des souhaits des intervenants (créé par Asma, Rafel et Makan).

---

## 👤 Développeurs

- **Makan KAMISSOKO** (*Mkamissoko*)  
- **Rafael TAVARES DE PINHO** (*rafael-tdp*)  
- **Asma MOKEDDES** (*asma12a*)  
- **Sharan VIJEYARUBAN** (*sharan1606*)  
- **IBRAHIM ABDOU Saidou** (*isaidou*)  

---

## 🚀 Procédure d'installation et de lancement

1. Clonez le repository en exécutant la commande suivante :  

   ```bash
   git clone https://github.com/rafael-tdp/hackathon-2024
   ```

2. Accédez au répertoire du projet :

  ```bash
   cd hackathon-2024
  ```

3. Ajouter le fichier .env à la racine du projet

4. Démarrez l'application avec Docker Compose :

  ```bash
  docker-compose up
  ```

5. Une fois le projet lancé, ouvrez votre navigateur et accédez à l'URL suivante :

  ```bash
   http://localhost:5173/
   ```

## 🔐 Comptes de test

Pour tester l'application, vous pouvez utiliser les trois profils suivants :

1. Admin

Email : <admin@user.com>
Mot de passe : Hackathon2024

2. Professeur

Email : <teacher@user.com>
Mot de passe : Hackathon2024

3. Élève

Email : <student@user.com>
Mot de passe : Hackathon2024

Nous espérons que notre projet vous apportera satisfaction et simplifiera la gestion des établissements scolaires !
