<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/super-admin/users')]
#[IsGranted('ROLE_SUPER_ADMIN')]
class SuperAdminController extends AbstractController
{
    #[Route('/requests', name: 'api_superadmin_requests', methods: ['GET'])]
    public function listRequests(EntityManagerInterface $em): JsonResponse
    {
        $users = $em->getRepository(User::class)->findBy(['adminRequestStatus' => 'pending']);

        $data = array_map(function ($u) {
            return [
                'id' => $u->getId(),
                'email' => $u->getUserIdentifier(),
                'nom' => $u->getNom(),
                'prenom' => $u->getPrenom()
            ];
        }, $users);

        return $this->json($data);
    }

    #[Route('/{id}/approve', name: 'api_superadmin_approve', methods: ['POST'])]
    public function approve(User $user, EntityManagerInterface $em): JsonResponse
    {
        $user->setAdminRequestStatus('approved');

        $roles = $user->getRoles();
        if (!in_array('ROLE_ADMIN', $roles)) {
            $roles[] = 'ROLE_ADMIN';
            $user->setRoles(array_unique($roles));
        }

        $em->flush();
        return $this->json(['message' => 'Demande approuvée. L\'utilisateur est maintenant Admin.']);
    }

    #[Route('/{id}/reject', name: 'api_superadmin_reject', methods: ['POST'])]
    public function reject(User $user, EntityManagerInterface $em): JsonResponse
    {
        $user->setAdminRequestStatus('rejected');
        $em->flush();

        return $this->json(['message' => 'Demande refusée.']);
    }
}