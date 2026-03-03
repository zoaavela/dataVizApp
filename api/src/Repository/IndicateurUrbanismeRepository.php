<?php

namespace App\Repository;

use App\Entity\IndicateurUrbanisme;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<IndicateurUrbanisme>
 */
class IndicateurUrbanismeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, IndicateurUrbanisme::class);
    }
}